import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, members, permissions, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';
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

    return await db.transaction(async (tx) => {
      // Find invitation by token
      const invitation = await tx.select().from(invitations)
        .where(and(
          eq(invitations.token, token),
          eq(invitations.acceptedAt, null as any)
        )).limit(1);

      if (!invitation.length) {
        return NextResponse.json(
          { error: 'Invalid or expired invitation' },
          { status: 404 }
        );
      }

      const invitationData = invitation[0];

      // Double-check if invitation has expired (after cleanup)
      if (new Date() > invitationData.expiresAt) {
        return NextResponse.json(
          { error: 'Invitation has expired' },
          { status: 410 }
        );
      }

      // Check if user exists with this email
      const existingUser = await tx.select().from(user)
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

      const userId = existingUser[0].id;

      // Check if user is already a member
      const existingMember = await tx.select().from(members)
        .where(and(
          eq(members.userId, userId),
          eq(members.projectId, invitationData.projectId)
        )).limit(1);

      if (existingMember.length) {
        // Mark invitation as accepted
        await tx.update(invitations)
          .set({ acceptedAt: new Date() })
          .where(eq(invitations.id, invitationData.id));

        return NextResponse.json({
          message: 'User is already a member of this project',
          projectId: invitationData.projectId
        });
      }

      // Create member record
      const newMember = await tx.insert(members).values({
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
        memberId: newMember[0].id,
        permission: perm.permission as 'handleFile' | 'viewFiles',
        granted: perm.granted,
        grantedAt: new Date(),
        grantedBy: invitationData.invitedBy
      }));

      await tx.insert(permissions).values(permissionInserts);

      // Mark invitation as accepted
      await tx.update(invitations)
        .set({ acceptedAt: new Date() })
        .where(eq(invitations.id, invitationData.id));

      return NextResponse.json({
        message: 'Successfully joined project',
        projectId: invitationData.projectId,
        memberId: newMember[0].id
      }, { status: 201 });
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

