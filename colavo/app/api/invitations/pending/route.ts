import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getPendingInvitations } from '@/lib/invitation-cleanup';

export async function GET() {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get pending invitations for this user
    const pendingInvitations = await getPendingInvitations(session.user.email);

    return NextResponse.json({
      invitations: pendingInvitations,
      count: pendingInvitations.length
    });

  } catch (error) {
    // Silently fail - error details not needed in production
    return NextResponse.json(
      { 
        error: 'Failed to get pending invitations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
