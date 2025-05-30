import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, or, and } from 'drizzle-orm';

// GET /api/projects - List user's projects
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get projects where user is either leader or member
    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        deadline: projects.deadline,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        leaderId: projects.leaderId,
        role: members.role,
      })
      .from(projects)
      .leftJoin(members, eq(members.projectId, projects.id))
      .where(
        or(
          eq(projects.leaderId, session.user.id),
          and(
            eq(members.userId, session.user.id)
          )
        )
      );

    // Group projects by role
    const ledProjects = userProjects.filter(p => p.leaderId === session.user.id);
    const memberProjects = userProjects.filter(p => p.leaderId !== session.user.id && p.role === 'member');

    return NextResponse.json({
      ledProjects,
      memberProjects,
      total: userProjects.length
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, deadline } = body;

    // Validate required fields
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

    // Validate deadline format if provided
    let deadlineDate = null;
    if (deadline) {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid deadline format' },
          { status: 400 }
        );
      }
    }

    // Generate IDs upfront
    const projectId = createId();
    const memberRecordId = createId();

    let createdProject = null;
    let createdMember = null;

    try {
      // 1. Create project
      const newProject = await db.insert(projects).values({
        id: projectId,
        name: name.trim(),
        description: description?.trim() || null,
        leaderId: session.user.id,
        deadline: deadlineDate,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      if (!newProject || newProject.length === 0) {
        throw new Error('Failed to create project');
      }
      createdProject = newProject[0];

      // 2. Create leader member record
      const leaderMember = await db.insert(members).values({
        id: memberRecordId,
        userId: session.user.id,
        projectId: projectId,
        role: 'leader',
        joinedAt: new Date()
      }).returning();

      if (!leaderMember || leaderMember.length === 0) {
        throw new Error('Failed to create leader member record');
      }
      createdMember = leaderMember[0];

      // 3. Grant all permissions to leader
      const allPermissions = [
        'createTask', 
        'handleTask', 
        'updateTask', 
        'handleEvent',
        'handleFile', 
        'addMember', 
        'createEvent', 
        'viewFiles'
      ];

      const permissionInserts = allPermissions.map(permission => ({
        id: createId(),
        memberId: memberRecordId,
        permission: permission as any,
        granted: true,
        grantedAt: new Date(),
        grantedBy: session.user.id
      }));

      await db.insert(permissions).values(permissionInserts);

      return NextResponse.json(createdProject, { status: 201 });

    } catch (error) {
      // Cleanup on failure - delete in reverse order
      console.error('Error in project creation, attempting cleanup:', error);
      
      try {
        // Delete permissions if member was created
        if (createdMember) {
          await db.delete(permissions).where(eq(permissions.memberId, memberRecordId));
        }
        
        // Delete member record if it was created
        if (createdMember) {
          await db.delete(members).where(eq(members.id, memberRecordId));
        }
        
        // Delete project if it was created
        if (createdProject) {
          await db.delete(projects).where(eq(projects.id, projectId));
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
        // Continue with original error
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 