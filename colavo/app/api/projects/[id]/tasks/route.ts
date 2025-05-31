import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, mainTasks, subTasks, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';

// Helper function to check if user has permission
async function checkPermission(userId: string, projectId: string, permission: string): Promise<boolean> {
  // Check if user is project leader
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (project.length > 0 && project[0]?.leaderId === userId) return true;

  // Check member permissions
  const memberPermission = await db
    .select()
    .from(members)
    .innerJoin(permissions, eq(permissions.memberId, members.id))
    .where(and(
      eq(members.userId, userId),
      eq(members.projectId, projectId),
      eq(permissions.permission, permission as any),
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
  if (!projectData) return false;
  
  return projectData.leaderId === userId || projectData.memberUserId === userId;
}

// GET /api/projects/[id]/tasks - List project main tasks
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
    const hasAccess = await checkProjectAccess(projectId, session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get main tasks with creator details
    const projectTasks = await db
      .select({
        id: mainTasks.id,
        title: mainTasks.title,
        description: mainTasks.description,
        importanceLevel: mainTasks.importanceLevel,
        deadline: mainTasks.deadline,
        createdBy: mainTasks.createdBy,
        createdAt: mainTasks.createdAt,
        updatedAt: mainTasks.updatedAt,
        creatorName: user.name,
        creatorEmail: user.email
      })
      .from(mainTasks)
      .innerJoin(user, eq(user.id, mainTasks.createdBy))
      .where(eq(mainTasks.projectId, projectId))
      .orderBy(mainTasks.createdAt);

    // Get sub-tasks for each main task
    const tasksWithSubTasks = await Promise.all(
      projectTasks.map(async (task) => {
        const taskSubTasks = await db
          .select({
            id: subTasks.id,
            title: subTasks.title,
            description: subTasks.description,
            status: subTasks.status,
            note: subTasks.note,
            deadline: subTasks.deadline,
            assignedId: subTasks.assignedId,
            createdBy: subTasks.createdBy,
            createdAt: subTasks.createdAt,
            updatedAt: subTasks.updatedAt,
            assignedUserName: user.name,
            assignedUserEmail: user.email
          })
          .from(subTasks)
          .leftJoin(user, eq(user.id, subTasks.assignedId))
          .where(eq(subTasks.mainTaskId, task.id))
          .orderBy(subTasks.createdAt);

        return {
          ...task,
          subTasks: taskSubTasks
        };
      })
    );

    return NextResponse.json(tasksWithSubTasks);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/tasks - Create new main task
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

    // Check if user has createTask permission
    const hasPermission = await checkPermission(session.user.id, projectId, 'createTask');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, importanceLevel, deadline } = body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    if (title.length > 500) {
      return NextResponse.json(
        { error: 'Task title must be less than 500 characters' },
        { status: 400 }
      );
    }

    if (importanceLevel && !['low', 'medium', 'high', 'critical'].includes(importanceLevel)) {
      return NextResponse.json(
        { error: 'Invalid importance level. Must be low, medium, high, or critical' },
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

    // Create main task
    const newTask = await db.insert(mainTasks).values({
      id: createId(),
      projectId: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      importanceLevel: importanceLevel || 'medium',
      deadline: deadlineDate,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get creator details for response
    const creator = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

    if (!creator.length || !creator[0] || !newTask.length || !newTask[0]) {
      return NextResponse.json(
        { error: 'Failed to create task or fetch creator details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...newTask[0],
      creatorName: creator[0].name,
      creatorEmail: creator[0].email,
      subTasks: []
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 