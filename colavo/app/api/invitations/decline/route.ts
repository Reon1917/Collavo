import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Find invitation by token and ensure it's for the current user
    const invitation = await db.select().from(invitations)
      .where(and(
        eq(invitations.token, token),
        eq(invitations.email, session.user.email),
        isNull(invitations.acceptedAt) // Only decline pending invitations
      )).limit(1);

    if (!invitation.length) {
      return NextResponse.json(
        { error: 'Invalid invitation or invitation not found' },
        { status: 404 }
      );
    }

    const invitationData = invitation[0]!;

    // Check if invitation has already expired
    if (new Date() > invitationData.expiresAt) {
      return NextResponse.json(
        { error: 'Invitation has already expired' },
        { status: 410 }
      );
    }

    // Delete the invitation record (decline by removal)
    await db.delete(invitations)
      .where(eq(invitations.id, invitationData.id));

    return NextResponse.json({
      message: 'Invitation declined successfully',
      projectId: invitationData.projectId
    }, { status: 200 });

  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}
