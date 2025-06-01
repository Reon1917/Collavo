import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireProjectAccess, requireLeaderRole } from '@/lib/auth-helpers';

// GET /api/projects/[id] - Get project details
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
    const access = await requireProjectAccess(session.user.id, projectId);

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

    return NextResponse.json({
      ...projectDetails[0],
      members: membersWithPermissions,
      userPermissions: access.permissions,
      isLeader: access.isLeader,
      userRole: access.role,
      currentUserId: session.user.id
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }
    
    //console.error('Project GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
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
    
    // Only project leaders can update project details
    await requireLeaderRole(session.user.id, projectId);

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
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Leader role required')) {
        return NextResponse.json(
          { error: 'Only project leader can update project details' },
          { status: 403 }
        );
      }
    }
    
    //console.error('Project PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project (partial update)
export async function PATCH(
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
    
    // Only project leaders can update project details
    await requireLeaderRole(session.user.id, projectId);

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
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Leader role required')) {
        return NextResponse.json(
          { error: 'Only project leader can update project details' },
          { status: 403 }
        );
      }
    }
    
    //console.error('Project PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
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
    
    // Only project leaders can delete projects
    await requireLeaderRole(session.user.id, projectId);

    // Delete project (cascade will handle related records)
    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Leader role required')) {
        return NextResponse.json(
          { error: 'Only project leader can delete project' },
          { status: 403 }
        );
      }
    }
    
    //console.error('Project DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 