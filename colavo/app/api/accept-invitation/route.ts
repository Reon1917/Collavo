import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, members, permissions, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, isNull } from 'drizzle-orm';
import { autoCleanupExpiredInvitations } from '@/lib/invitation-cleanup';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Auto-cleanup expired invitations first
    await autoCleanupExpiredInvitations();

    // Find invitation by token
    const invitation = await db.select().from(invitations)
        .where(and(
          eq(invitations.token, token),
          isNull(invitations.acceptedAt)
        )).limit(1);

      if (!invitation.length) {
        return NextResponse.json(
          { error: 'Invalid or expired invitation' },
          { status: 404 }
        );
      }

      const invitationData = invitation[0]!;

      // Double-check if invitation has expired (after cleanup)
      if (new Date() > invitationData.expiresAt) {
        return NextResponse.json(
          { error: 'Invitation has expired' },
          { status: 410 }
        );
      }

    // Check if user exists with this email
    const existingUser = await db.select().from(user)
        .where(eq(user.email, invitationData.email))
        .limit(1);

      if (!existingUser.length) {
        // User doesn't exist - they need to register first
        return NextResponse.json({
          requiresRegistration: true,
          email: invitationData.email,
          projectId: invitationData.projectId,
          token,
          expiresAt: invitationData.expiresAt
        });
      }

      const userId = existingUser[0]!.id;

    // Check if user is already a member
    const existingMember = await db.select().from(members)
        .where(and(
          eq(members.userId, userId),
          eq(members.projectId, invitationData.projectId)
        )).limit(1);

      if (existingMember.length) {
      // Mark invitation as accepted
      await db.update(invitations)
        .set({ acceptedAt: new Date() })
        .where(eq(invitations.id, invitationData.id));

        return NextResponse.json({
          message: 'User is already a member of this project',
          projectId: invitationData.projectId
        });
      }

    // Create member record
    const newMember = await db.insert(members).values({
        id: createId(),
        userId,
        projectId: invitationData.projectId,
        role: 'member',
        joinedAt: new Date()
      }).returning();

      if (!newMember.length) {
        return NextResponse.json(
          { error: 'Failed to create member record' },
          { status: 500 }
        );
      }

      // Grant default permissions
      const defaultPermissions = [
        { permission: 'handleFile', granted: true },
        { permission: 'viewFiles', granted: true }
      ];

      const permissionInserts = defaultPermissions.map(perm => ({
        id: createId(),
        memberId: newMember[0]!.id,
        permission: perm.permission as 'handleFile' | 'viewFiles',
        granted: perm.granted,
        grantedAt: new Date(),
        grantedBy: invitationData.invitedBy
      }));

    await db.insert(permissions).values(permissionInserts);

    // Mark invitation as accepted
    await db.update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invitationData.id));

    return NextResponse.json({
      message: 'Successfully joined project',
      projectId: invitationData.projectId,
      memberId: newMember[0]!.id
    }, { status: 201 });

  } catch {
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

