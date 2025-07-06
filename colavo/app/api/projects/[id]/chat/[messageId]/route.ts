import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/auth-helpers';

// GET /api/projects/[id]/chat/[messageId] - Get message details (for debugging)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
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

    const { id: projectId, messageId } = await params;

    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get message details
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    // Test if we can perform a dummy update on this message (if it belongs to user)
    if (message && message.user_id === session.user.id) {
      await supabase
        .from('messages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('project_id', projectId)
        .eq('user_id', session.user.id);
    }

    return NextResponse.json({
      message,
      error: fetchError,
      canEdit: message?.user_id === session.user.id,
      projectAccess: {
        hasAccess: projectAccess.hasAccess,
        isLeader: projectAccess.isLeader,
        isMember: projectAccess.isMember
      }
    });

  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/chat/[messageId] - Update a chat message
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
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

    const { id: projectId, messageId } = await params;

    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // First, check if the message exists and belongs to the user
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('project_id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !existingMessage) {
      return NextResponse.json(
        { error: 'Message not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Update the message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({
        content: content.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });

  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/chat/[messageId] - Delete a chat message
// SECURITY: This endpoint uses service role key but has multiple security layers:
// 1. User authentication verification
// 2. Project access permission check  
// 3. Message ownership verification
// 4. Explicit user ID matching before deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
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

    const { id: projectId, messageId } = await params;

    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();

    // First, verify the message exists and belongs to the user
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('project_id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !existingMessage) {
      return NextResponse.json(
        { error: 'Message not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the message
    const { error: deleteError, count } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('project_id', projectId)
      .eq('user_id', session.user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }

    // Check if deletion was successful
    if (count === 0) {
      return NextResponse.json(
        { error: 'Message not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Double-check that the message is actually deleted
    const { data: verifyDeleted } = await supabase
      .from('messages')
      .select('id')
      .eq('id', messageId)
      .single();

    if (verifyDeleted) {
      return NextResponse.json(
        { error: 'Message deletion failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 