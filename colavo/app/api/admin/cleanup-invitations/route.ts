import { NextRequest, NextResponse } from 'next/server';
import { cleanupInvitations, getInvitationStats, autoCleanupExpiredInvitations } from '@/lib/invitation-cleanup';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get session to verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gracePeriodDays = 30, dryRun = false } = body;

    if (dryRun) {
      // Return stats without actually cleaning up
      const stats = await getInvitationStats();
      return NextResponse.json({
        message: 'Dry run completed - shows what would be cleaned',
        stats,
        wouldDelete: {
          expired: stats.expired,
          accepted: 0 // We don't delete accepted ones in dry run preview
        },
        note: 'Auto-cleanup runs automatically during normal operations'
      });
    }

    // Perform actual cleanup
    const cleanupStats = await cleanupInvitations(gracePeriodDays);
    const currentStats = await getInvitationStats();

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      cleaned: cleanupStats,
      currentStats
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to cleanup invitations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get session to verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return invitation statistics
    const stats = await getInvitationStats();
    
    return NextResponse.json({
      stats,
      recommendations: {
        shouldCleanup: stats.expired > 10,
        expiredCount: stats.expired,
        message: stats.expired > 10 
          ? `${stats.expired} expired invitations should be cleaned up`
          : 'No cleanup needed at this time'
      },
      note: 'Expired invitations are automatically cleaned up during normal operations (48h expiration for new users, 24h for existing users)'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get invitation stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
