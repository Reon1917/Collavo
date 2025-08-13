import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { mainTasks, subTasks, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, inArray } from 'drizzle-orm';
import { requireProjectAccess, checkPermissionDetailed, createPermissionErrorResponse } from '@/lib/auth-helpers';

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
    
    // Use centralized access control
    await requireProjectAccess(session.user.id, projectId);

    // All project members can see all tasks
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

    // Get all sub-tasks for project in a single query to avoid N+1
    const taskIds = projectTasks.map(t => t.id);
    const allSubTasks = taskIds.length > 0 ? await db
      .select({
        id: subTasks.id,
        mainTaskId: subTasks.mainTaskId,
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
      .where(inArray(subTasks.mainTaskId, taskIds))
      .orderBy(subTasks.createdAt) : [];

    // Group subtasks by main task ID
    const subTasksByMainTask = allSubTasks.reduce((acc, subTask) => {
      if (!acc[subTask.mainTaskId]) acc[subTask.mainTaskId] = [];
      acc[subTask.mainTaskId]!.push(subTask);
      return acc;
    }, {} as Record<string, typeof allSubTasks>);

    // Combine tasks with their subtasks
    const tasksWithSubTasks = projectTasks.map(task => ({
      ...task,
      subTasks: subTasksByMainTask[task.id] || []
    }));

    return NextResponse.json(tasksWithSubTasks);

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
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'createTask');
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.errorType === 'INVALID_PROJECT' ? 404 : 403;
      return NextResponse.json(
        createPermissionErrorResponse(permissionCheck),
        { status: statusCode }
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

    // Validate description length if provided
    if (description && typeof description === 'string' && description.length > 2000) {
      return NextResponse.json(
        { error: 'Task description must be less than 2000 characters' },
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

    // Create main task and fetch creator details atomically
    const result = await db.transaction(async (tx) => {
      const newTask = await tx.insert(mainTasks).values({
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

      if (!newTask.length || !newTask[0]) {
        throw new Error('Failed to create task');
      }

      // Get creator details for response
      const creator = await tx.select().from(user).where(eq(user.id, session.user.id)).limit(1);

      if (!creator.length || !creator[0]) {
        throw new Error('Failed to fetch creator details');
      }

      return {
        ...newTask[0],
        creatorName: creator[0].name,
        creatorEmail: creator[0].email,
        subTasks: []
      };
    });

    return NextResponse.json(result, { status: 201 });

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