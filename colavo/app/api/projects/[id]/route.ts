import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to check if user has access to project
async function checkProjectAccess(projectId: string, userId: string) {
  const project = await db
    .select({
      id: projects.id,
      leaderId: projects.leaderId,
      memberUserId: members.userId,
      memberRole: members.role
    })
    .from(projects)
    .leftJoin(members, eq(members.projectId, projects.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project.length) {
    return { hasAccess: false, isLeader: false, project: null };
  }

  const projectData = project[0];
  const isLeader = projectData.leaderId === userId;
  const isMember = projectData.memberUserId === userId;
  const hasAccess = isLeader || isMember;

  return { hasAccess, isLeader, project: projectData };
}

// GET /api/projects/[id] - Get project details
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
    const { hasAccess } = await checkProjectAccess(projectId, session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get detailed project information
    const projectDetails = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        deadline: projects.deadline,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        leaderId: projects.leaderId,
        leaderName: user.name,
        leaderEmail: user.email
      })
      .from(projects)
      .innerJoin(user, eq(user.id, projects.leaderId))
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!projectDetails.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get project members
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

    // Get current user's permissions
    const currentUserMember = projectMembers.find(m => m.userId === session.user.id);
    let userPermissions = [];

    if (currentUserMember) {
      const permissionRecords = await db
        .select({
          permission: permissions.permission,
          granted: permissions.granted
        })
        .from(permissions)
        .where(eq(permissions.memberId, currentUserMember.id));

      userPermissions = permissionRecords
        .filter(p => p.granted)
        .map(p => p.permission);
    }

    return NextResponse.json({
      ...projectDetails[0],
      members: projectMembers,
      userPermissions,
      isLeader: projectDetails[0].leaderId === session.user.id
    });

  } catch (error) {
    console.error('Error fetching project details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
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
    const { hasAccess, isLeader } = await checkProjectAccess(projectId, session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Only project leader can update project details
    if (!isLeader) {
      return NextResponse.json(
        { error: 'Only project leader can update project details' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, deadline } = body;

    // Validate fields
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Project name is required' },
          { status: 400 }
        );
      }
      if (name.length > 255) {
        return NextResponse.json(
          { error: 'Project name must be less than 255 characters' },
          { status: 400 }
        );
      }
    }

    let deadlineDate = undefined;
    if (deadline !== undefined) {
      if (deadline === null) {
        deadlineDate = null;
      } else {
        deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid deadline format' },
            { status: 400 }
          );
        }
      }
    }

    // Update project
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (deadline !== undefined) updateData.deadline = deadlineDate;

    const updatedProject = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    return NextResponse.json(updatedProject[0]);

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
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
    const { hasAccess, isLeader } = await checkProjectAccess(projectId, session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Only project leader can delete project
    if (!isLeader) {
      return NextResponse.json(
        { error: 'Only project leader can delete project' },
        { status: 403 }
      );
    }

    // Delete project (cascade will handle related records)
    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 