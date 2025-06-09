import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { members, permissions, user, mainTasks, subTasks, events, files } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';
import { requireProjectAccess, hasPermission } from '@/lib/auth-helpers';

// GET /api/projects/[id]/members - List project members
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
    
    // Use centralized access control
    await requireProjectAccess(session.user.id, projectId);

    // Get project members with user details and permissions
    const projectMembers = await db
      .select({
        id: members.id,
        userId: members.userId,
        role: members.role,
        joinedAt: members.joinedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image
      })
      .from(members)
      .innerJoin(user, eq(user.id, members.userId))
      .where(eq(members.projectId, projectId));

    // Get permissions for each member
    const membersWithPermissions = await Promise.all(
      projectMembers.map(async (member) => {
        const memberPermissions = await db
          .select({
            permission: permissions.permission,
            granted: permissions.granted
          })
          .from(permissions)
          .where(eq(permissions.memberId, member.id));

        const grantedPermissions = memberPermissions
          .filter(p => p.granted)
          .map(p => p.permission);

        return {
          ...member,
          permissions: grantedPermissions
        };
      })
    );

    return NextResponse.json(membersWithPermissions);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Add project member
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

    // Check if user has addMember permission
    const canAddMembers = await hasPermission(session.user.id, projectId, 'addMember');
    if (!canAddMembers) {
      return NextResponse.json(
        { error: 'Insufficient permissions to add members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { identifier, identifierType } = body;

    // Validate input
    if (!identifier || !identifierType) {
      return NextResponse.json(
        { error: 'Identifier and identifier type are required' },
        { status: 400 }
      );
    }

    if (!['id', 'email', 'username'].includes(identifierType)) {
      return NextResponse.json(
        { error: 'Invalid identifier type. Must be id, email, or username' },
        { status: 400 }
      );
    }

    // Find user by identifier
    let targetUser: any[] = [];
    switch (identifierType) {
      case 'id':
        targetUser = await db.select().from(user).where(eq(user.id, identifier)).limit(1);
        break;
      case 'email':
        targetUser = await db.select().from(user).where(eq(user.email, identifier)).limit(1);
        break;
      case 'username':
        // Assuming name field is used as username
        targetUser = await db.select().from(user).where(eq(user.name, identifier)).limit(1);
        break;
    }

    if (!targetUser.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const foundUser = targetUser[0];
    if (!foundUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to add themselves (already handled by leader check, but good to be explicit)
    if (foundUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a member' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await db.select().from(members)
      .where(and(
        eq(members.userId, foundUser.id),
        eq(members.projectId, projectId)
      )).limit(1);

    if (existingMember.length) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 409 }
      );
    }

    // Create member record
    const newMember = await db.insert(members).values({
      id: createId(),
      userId: foundUser.id,
      projectId: projectId,
      role: 'member',
      joinedAt: new Date()
    }).returning();

    if (!newMember.length || !newMember[0]) {
      return NextResponse.json(
        { error: 'Failed to create member record' },
        { status: 500 }
      );
    }

    // Grant default permissions (handleFile and viewFiles as specified in the plan)
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
      grantedBy: session.user.id
    }));

    await db.insert(permissions).values(permissionInserts);

    // Return member with user details
    return NextResponse.json({
      id: newMember[0]!.id,
      userId: foundUser.id,
      role: newMember[0]!.role,
      joinedAt: newMember[0]!.joinedAt,
      userName: foundUser.name,
      userEmail: foundUser.email,
      userImage: foundUser.image,
      permissions: defaultPermissions.map(p => p.permission)
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/members - Remove project member
export async function DELETE(
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

    // Check if user has addMember permission (same permission for adding/removing)
    const canManageMembers = await hasPermission(session.user.id, projectId, 'addMember');
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Insufficient permissions to remove members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent removing yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the project' },
        { status: 400 }
      );
    }

    // Check if user is a member of this project
    const memberToRemove = await db.select()
      .from(members)
      .where(and(
        eq(members.userId, userId),
        eq(members.projectId, projectId)
      )).limit(1);

    if (!memberToRemove.length) {
      return NextResponse.json(
        { error: 'User is not a member of this project' },
        { status: 404 }
      );
    }

    const member = memberToRemove[0]!;

    // Cascade delete all content created/assigned to this member
    // We need to do this in the correct order to handle foreign key constraints

    // 1. First, delete or update subtasks assigned to this member
    // Option A: Delete subtasks assigned to them
    await db.delete(subTasks)
      .where(eq(subTasks.assignedId, userId));

    // 2. Delete subtasks created by this member (that aren't already deleted)
    await db.delete(subTasks)
      .where(eq(subTasks.createdBy, userId));

    // 3. Delete main tasks created by this member (this will cascade delete remaining subtasks)
    await db.delete(mainTasks)
      .where(and(
        eq(mainTasks.createdBy, userId),
        eq(mainTasks.projectId, projectId)
      ));

    // 4. Delete events created by this member
    await db.delete(events)
      .where(and(
        eq(events.createdBy, userId),
        eq(events.projectId, projectId)
      ));

    // 5. Delete files added by this member
    await db.delete(files)
      .where(and(
        eq(files.addedBy, userId),
        eq(files.projectId, projectId)
      ));

    // 6. Delete member permissions (foreign key constraint)
    await db.delete(permissions)
      .where(eq(permissions.memberId, member.id));

    // 7. Finally, delete member record
    await db.delete(members)
      .where(eq(members.id, member.id));

    return NextResponse.json({ 
      message: 'Member and all their content removed successfully',
      removedUserId: userId 
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 