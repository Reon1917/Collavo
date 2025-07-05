import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { checkProjectAccess } from '@/lib/auth-helpers';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { ChatMessage, CreateChatMessageData } from '@/types';

// GET /api/projects/[id]/chat - Get chat messages with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    
    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const before = url.searchParams.get('before');
    const after = url.searchParams.get('after');

    const supabase = createServerSupabaseClient();
    
    // Build query with pagination
    let query = supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', new Date(before).toISOString());
    } else if (after) {
      query = query.gt('created_at', new Date(after).toISOString());
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Get user details for messages
    const userIds = [...new Set(messages?.map(m => m.user_id) || [])];
    const users = userIds.length > 0 ? await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image
      })
      .from(user)
      .where(inArray(user.id, userIds)) : [];

    // Create a user map for efficient lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    // Transform messages and add user data
    const transformedMessages: ChatMessage[] = messages?.map(msg => {
      const userData = userMap.get(msg.user_id);
      return {
        id: msg.id,
        projectId: msg.project_id,
        userId: msg.user_id,
        content: msg.content,
        messageType: msg.message_type as 'text' | 'system' | 'file',
        createdAt: new Date(msg.created_at),
        updatedAt: new Date(msg.updated_at),
        replyTo: msg.reply_to,
        isEdited: msg.is_edited,
        editedAt: msg.edited_at ? new Date(msg.edited_at) : null,
        ...(userData && { user: userData })
      };
    }) || [];

    // Messages are already sorted by created_at ASC from database

    return NextResponse.json({
      messages: transformedMessages,
      hasMore: messages?.length === limit,
      total: messages?.length || 0
    });

  } catch (error) {
    console.error('Chat messages fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/chat - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    
    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body: CreateChatMessageData = await request.json();
    
    // Validate input
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (body.content.length > 4000) {
      return NextResponse.json(
        { error: 'Message content is too long (max 4000 characters)' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // If replying to a message, verify it exists and is from the same project
    if (body.replyTo) {
      const { data: parentMessage, error: parentError } = await supabase
        .from('messages')
        .select('id, project_id')
        .eq('id', body.replyTo)
        .eq('project_id', projectId)
        .single();

      if (parentError || !parentMessage) {
        return NextResponse.json(
          { error: 'Parent message not found' },
          { status: 400 }
        );
      }
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        user_id: session.user.id,
        content: body.content.trim(),
        message_type: body.messageType || 'text',
        reply_to: body.replyTo || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Get user details for the response
    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Transform response
    const transformedMessage: ChatMessage = {
      id: message.id,
      projectId: message.project_id,
      userId: message.user_id,
      content: message.content,
      messageType: message.message_type as 'text' | 'system' | 'file',
      createdAt: new Date(message.created_at),
      updatedAt: new Date(message.updated_at),
      replyTo: message.reply_to,
      isEdited: message.is_edited,
      editedAt: message.edited_at ? new Date(message.edited_at) : null,
      ...(userData[0] && { user: userData[0] })
    };

    return NextResponse.json(transformedMessage, { status: 201 });

  } catch (error) {
    console.error('Chat message creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 