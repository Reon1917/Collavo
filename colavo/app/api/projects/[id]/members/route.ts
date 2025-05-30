import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';

// Helper function to check if user has permission
async function checkPermission(userId: string, projectId: string, permission: string): Promise<boolean> {
  // Check if user is project leader
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (project[0]?.leaderId === userId) return true;

  // Check member permissions
  const memberPermission = await db
    .select()
    .from(members)
    .innerJoin(permissions, eq(permissions.memberId, members.id))
    .where(and(
      eq(members.userId, userId),
      eq(members.projectId, projectId),
      eq(permissions.permission, permission),
      eq(permissions.granted, true)
    )).limit(1);

  return memberPermission.length > 0;
}

// Helper function to check project access
async function checkProjectAccess(projectId: string, userId: string) {
  const project = await db
    .select({
      id: projects.id,
      leaderId: projects.leaderId,
      memberUserId: members.userId
    })
    .from(projects)
    .leftJoin(members, eq(members.projectId, projects.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project.length) return false;

  const projectData = project[0];
  return projectData.leaderId === userId || projectData.memberUserId === userId;
}

// GET /api/projects/[id]/members - List project members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const projectId = params.id;
    const hasAccess = await checkProjectAccess(projectId, session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

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
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Add project member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const projectId = params.id;

    // Check if user has addMember permission
    const hasPermission = await checkPermission(session.user.id, projectId, 'addMember');
    if (!hasPermission) {
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
    let targetUser;
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

    // Grant default permissions (handleFile and viewFiles as specified in the plan)
    const defaultPermissions = [
      { permission: 'handleFile', granted: true },
      { permission: 'viewFiles', granted: true }
    ];

    const permissionInserts = defaultPermissions.map(perm => ({
      id: createId(),
      memberId: newMember[0].id,
      permission: perm.permission as any,
      granted: perm.granted,
      grantedAt: new Date(),
      grantedBy: session.user.id
    }));

    await db.insert(permissions).values(permissionInserts);

    // Return member with user details
    return NextResponse.json({
      id: newMember[0].id,
      userId: foundUser.id,
      role: newMember[0].role,
      joinedAt: newMember[0].joinedAt,
      userName: foundUser.name,
      userEmail: foundUser.email,
      userImage: foundUser.image,
      permissions: defaultPermissions.map(p => p.permission)
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding project member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 