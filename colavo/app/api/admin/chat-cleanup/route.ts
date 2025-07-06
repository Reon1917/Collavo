import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/admin/chat-cleanup - Get cleanup statistics
export async function GET(request: NextRequest) {
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

    // Note: You might want to add admin role check here
    // For now, any authenticated user can view cleanup stats
    
    const supabase = createServerSupabaseClient();
    
    // Get cleanup statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_cleanup_stats');

    if (statsError) {
      console.error('Error fetching cleanup stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch cleanup statistics' },
        { status: 500 }
      );
    }

    // Get recent cleanup history
    const { data: history, error: historyError } = await supabase
      .from('recent_cleanup_history')
      .select('*');

    if (historyError) {
      console.error('Error fetching cleanup history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch cleanup history' },
        { status: 500 }
      );
    }

    // Get current message count
    const { count: messageCount, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching message count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch message count' },
        { status: 500 }
      );
    }

    // Get count of messages older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: oldMessageCount, error: oldCountError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', sevenDaysAgo.toISOString());

    if (oldCountError) {
      console.error('Error fetching old message count:', oldCountError);
      return NextResponse.json(
        { error: 'Failed to fetch old message count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      statistics: stats?.[0] || {
        total_cleanups: 0,
        total_messages_deleted: 0,
        last_cleanup_date: null,
        average_messages_per_cleanup: 0
      },
      current_message_count: messageCount || 0,
      old_message_count: oldMessageCount || 0,
      recent_history: history || [],
      cleanup_threshold_days: 7
    });

  } catch (error) {
    console.error('Chat cleanup stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/chat-cleanup - Manually trigger cleanup
export async function POST(request: NextRequest) {
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

    // Note: You might want to add admin role check here
    // For now, any authenticated user can trigger cleanup

    const supabase = createServerSupabaseClient();

    // Get count of messages that will be deleted (for logging)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: messagesToDelete, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', sevenDaysAgo.toISOString());

    if (countError) {
      console.error('Error counting messages to delete:', countError);
      return NextResponse.json(
        { error: 'Failed to count messages for deletion' },
        { status: 500 }
      );
    }

    // Trigger manual cleanup
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('manual_cleanup_old_messages');

    if (cleanupError) {
      console.error('Error during manual cleanup:', cleanupError);
      return NextResponse.json(
        { error: 'Failed to perform cleanup', details: cleanupError.message },
        { status: 500 }
      );
    }

    const result = cleanupResult?.[0] || { deleted_count: 0, cleanup_timestamp: new Date() };

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deleted_count} messages`,
      deleted_count: result.deleted_count,
      cleanup_timestamp: result.cleanup_timestamp,
      messages_found_for_deletion: messagesToDelete || 0
    });

  } catch (error) {
    console.error('Manual cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/chat-cleanup - Remove cleanup schedule (for testing)
export async function DELETE(request: NextRequest) {
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

    const supabase = createServerSupabaseClient();

    // Remove the scheduled cleanup job
    const { error } = await supabase
      .from('cron.job')
      .delete()
      .eq('jobname', 'cleanup-old-messages');

    if (error) {
      console.error('Error removing cleanup schedule:', error);
      return NextResponse.json(
        { error: 'Failed to remove cleanup schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup schedule removed successfully'
    });

  } catch (error) {
    console.error('Remove cleanup schedule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 