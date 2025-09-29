import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, user, mainTasks, events, files } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
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
      if (error.message.includes('no longer exists') || error.message.includes('has been deleted')) {
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'PROJECT_DELETED',
            shouldRedirect: true,
            redirectTo: '/dashboard'
          },
          { status: 404 }
        );
      }
      if (error.message.includes('not found') || error.message.includes('access denied') || error.message.includes('not a member')) {
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'ACCESS_DENIED'
          },
          { status: 403 }
        );
      }
    }

    console.error('Project GET error:', error);
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
      if (error.message.includes('no longer exists') || error.message.includes('has been deleted')) {
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'PROJECT_DELETED',
            shouldRedirect: true,
            redirectTo: '/dashboard'
          },
          { status: 404 }
        );
      }
      if (error.message.includes('not found') || error.message.includes('access denied') || error.message.includes('not a member')) {
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'ACCESS_DENIED'
          },
          { status: 403 }
        );
      }
      if (error.message.includes('Leader role required')) {
        return NextResponse.json(
          { error: 'Only project leader can update project details' },
          { status: 403 }
        );
      }
    }

    console.error('Project PUT error:', error);
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
      if (error.message.includes('no longer exists') || error.message.includes('has been deleted')) {
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'PROJECT_DELETED',
            shouldRedirect: true,
            redirectTo: '/dashboard'
          },
          { status: 404 }
        );
      }
      if (error.message.includes('not found') || error.message.includes('access denied') || error.message.includes('not a member')) {
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'ACCESS_DENIED'
          },
          { status: 403 }
        );
      }
      if (error.message.includes('Leader role required')) {
        return NextResponse.json(
          { error: 'Only project leader can update project details' },
          { status: 403 }
        );
      }
    }

    console.error('Project PATCH error:', error);
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
    console.log('[DELETE PROJECT] Starting project deletion process');
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      console.log('[DELETE PROJECT] No session/user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    console.log('[DELETE PROJECT] Project ID:', projectId, 'Requester:', session.user.id);
    
    // Only project leaders can delete projects
    console.log('[DELETE PROJECT] Verifying leader role for user:', session.user.id);
    await requireLeaderRole(session.user.id, projectId);
    console.log('[DELETE PROJECT] Leader role verified - user authorized to delete project');

    // Get project data before deletion for logging
    console.log('[DELETE PROJECT] Fetching project data before deletion');
    const projectData = await db
      .select({
        id: projects.id,
        name: projects.name,
        leaderId: projects.leaderId,
        createdAt: projects.createdAt
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (projectData.length) {
      console.log('[DELETE PROJECT] Project details:', {
        name: projectData[0].name,
        leaderId: projectData[0].leaderId,
        createdAt: projectData[0].createdAt
      });
    }

    // Get counts of related data that will be cascade deleted
    console.log('[DELETE PROJECT] Analyzing related data before deletion...');

    const memberCount = await db
      .select({ count: sql`count(*)` })
      .from(members)
      .where(eq(members.projectId, projectId));

    const taskCount = await db
      .select({ count: sql`count(*)` })
      .from(mainTasks)
      .where(eq(mainTasks.projectId, projectId));

    const eventCount = await db
      .select({ count: sql`count(*)` })
      .from(events)
      .where(eq(events.projectId, projectId));

    const fileCount = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(eq(files.projectId, projectId));

    console.log('[DELETE PROJECT] Related data counts:', {
      members: memberCount[0]?.count || 0,
      mainTasks: taskCount[0]?.count || 0,
      events: eventCount[0]?.count || 0,
      files: fileCount[0]?.count || 0
    });

    // Delete project (cascade will handle related records)
    console.log('[DELETE PROJECT] Executing project deletion with CASCADE...');
    await db.delete(projects).where(eq(projects.id, projectId));
    console.log('[DELETE PROJECT] Project deletion completed successfully');

    return NextResponse.json({
      message: 'Project deleted successfully',
      deletedProject: {
        id: projectId,
        name: projectData[0]?.name || 'Unknown'
      }
    });

  } catch (error) {
    console.error('[DELETE PROJECT] Error occurred:', error);

    if (error instanceof Error) {
      console.error('[DELETE PROJECT] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error.message.includes('no longer exists') || error.message.includes('has been deleted')) {
        console.error('[DELETE PROJECT] Project not found/deleted error:', error.message);
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'PROJECT_DELETED',
            shouldRedirect: true,
            redirectTo: '/dashboard'
          },
          { status: 404 }
        );
      }
      if (error.message.includes('not found') || error.message.includes('access denied') || error.message.includes('not a member')) {
        console.error('[DELETE PROJECT] Access denied error:', error.message);
        return NextResponse.json(
          {
            error: error.message,
            errorType: 'ACCESS_DENIED'
          },
          { status: 403 }
        );
      }
      if (error.message.includes('Leader role required')) {
        console.error('[DELETE PROJECT] Permission denied - not leader');
        return NextResponse.json(
          { error: 'Only project leader can delete project' },
          { status: 403 }
        );
      }
    }

    console.error('[DELETE PROJECT] Unexpected error during project deletion');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 