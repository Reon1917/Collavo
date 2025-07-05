import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { checkProjectAccess } from '@/lib/auth-helpers';

// GET /api/projects/[id]/chat/[messageId] - Debug endpoint to check message details
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

    console.log('🔍 DEBUG: Getting message details', {
      projectId,
      messageId,
      userId: session.user.id
    });

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

    console.log('🔍 DEBUG: Message lookup result', {
      found: !!message,
      error: fetchError,
      messageData: message
    });

    // Test if we can perform a dummy update on this message (if it belongs to user)
    if (message && message.user_id === session.user.id) {
      const { error: updateTestError } = await supabase
        .from('messages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('project_id', projectId)
        .eq('user_id', session.user.id);

      console.log('🔍 DEBUG: Update test result', {
        updateError: updateTestError
      });
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

  } catch (error) {
    console.error('🔍 DEBUG: Error in GET endpoint:', error);
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
      console.error('Error updating message:', updateError);
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });

  } catch (error) {
    console.error('Error in PUT /api/projects/[id]/chat/[messageId]:', error);
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
  console.log('🗑️ DELETE: Function called - starting deletion process');
  
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      console.log('🗑️ DELETE: Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId, messageId } = await params;
    console.log('🗑️ DELETE: Parameters received:', { projectId, messageId, userId: session.user.id });


    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      console.log('🗑️ DELETE: Access denied to project');
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
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

    console.log('🗑️ DELETE: Message lookup result:', {
      found: !!existingMessage,
      error: fetchError?.code
    });

    if (fetchError || !existingMessage) {
      console.log('🗑️ DELETE: Message not found or no permission');
      return NextResponse.json(
        { error: 'Message not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the message
    console.log('🗑️ DELETE: Attempting to delete message:', messageId);

    const { error: deleteError, count } = await supabase
      .from('messages')
      .delete({ count: 'exact' })
      .eq('id', messageId)
      .eq('project_id', projectId)
      .eq('user_id', session.user.id);

    console.log('🗑️ DELETE: Deletion result:', {
      success: !deleteError && (count || 0) > 0,
      error: deleteError?.code,
      deletedCount: count || 0
    });

    if (deleteError) {
      console.error('🗑️ DELETE: Error deleting message:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete message', details: deleteError.message },
        { status: 500 }
      );
    }

    // Check if any rows were actually deleted
    if ((count || 0) === 0) {
      console.log('🗑️ DELETE: No rows were deleted - message may not exist or user lacks permission');
      return NextResponse.json(
        { error: 'Message not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Verify deletion was successful
    const { data: verifyMessage, error: verifyError } = await supabase
      .from('messages')
      .select('id')
      .eq('id', messageId)
      .single();

    console.log('🗑️ DELETE: Verification result:', {
      messageStillExists: !!verifyMessage,
      verifyError: verifyError?.code // Should be 'PGRST116' if not found
    });

    console.log('🗑️ DELETE: Successfully deleted message');
    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
      deletedMessageId: messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🗑️ DELETE: Error in DELETE endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 