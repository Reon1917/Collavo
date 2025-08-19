import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { members, permissions, user, mainTasks, subTasks, events, files } from '@/db/schema';

import { eq, and } from 'drizzle-orm';
import { requireProjectAccess, checkPermissionDetailed, createPermissionErrorResponse } from '@/lib/auth-helpers';
import { handleEmailInvitation } from '@/lib/invitation-helpers';

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

    // Check if user has addMember permission with detailed error info
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'addMember');
    
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.errorType === 'INVALID_PROJECT' ? 404 : 403;
      return NextResponse.json(
        createPermissionErrorResponse(permissionCheck),
        { status: statusCode }
      );
    }

    const body = await request.json();
    const { identifier, identifierType, userType } = body;

    // Validate input
    if (!identifier || !identifierType) {
      return NextResponse.json(
        { error: 'Identifier and identifier type are required' },
        { status: 400 }
      );
    }

    if (!userType || !['existing', 'new'].includes(userType)) {
      return NextResponse.json(
        { error: 'User type is required. Must be existing or new' },
        { status: 400 }
      );
    }

    if (!['id', 'email', 'username'].includes(identifierType)) {
      return NextResponse.json(
        { error: 'Invalid identifier type. Must be id, email, or username' },
        { status: 400 }
      );
    }

    // Validate combinations
    if (userType === 'new' && identifierType !== 'email') {
      return NextResponse.json(
        { error: 'New users can only be invited by email address' },
        { status: 400 }
      );
    }
    
    // Handle based on user type selection
    if (userType === 'new') {
      // For new users, we just send invitation email without checking if user exists
      // This eliminates the database lookup completely
      return await handleEmailInvitation(identifier, projectId, session.user.id, 'new_user');
    }

    // For existing users, we need to find them and validate
    let targetUser: any[] = [];
    try {
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
    } catch (dbError) {
      // Silently handle database errors
      throw dbError;
    }

    // For existing users, they must be found in database
    if (!targetUser.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const foundUser = targetUser[0];
    
    // Check if user is trying to add themselves
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

    // Send invitation email to existing user
    return await handleEmailInvitation(foundUser.email, projectId, session.user.id, 'existing_user');

  } catch (error) {
    // Silently handle API errors
    
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
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'addMember');
    if (!permissionCheck.hasPermission) {
      return NextResponse.json(
        createPermissionErrorResponse(permissionCheck),
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