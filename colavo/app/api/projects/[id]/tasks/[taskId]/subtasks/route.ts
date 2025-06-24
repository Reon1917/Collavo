import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, mainTasks, subTasks, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';
import { scheduleSubTaskNotification } from '@/lib/notification-scheduler';

// Define the permission type to match the schema enum
type PermissionType = "createTask" | "handleTask" | "updateTask" | "handleEvent" | "handleFile" | "addMember" | "createEvent" | "viewFiles";

// Helper function to check if user has permission
async function checkPermission(userId: string, projectId: string, permission: PermissionType): Promise<boolean> {
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

// GET /api/projects/[id]/tasks/[taskId]/subtasks - List sub-tasks for a main task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
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

    const { id: projectId, taskId: mainTaskId } = await params;

    // Verify main task exists and belongs to project
    const mainTask = await db
      .select()
      .from(mainTasks)
      .where(and(
        eq(mainTasks.id, mainTaskId),
        eq(mainTasks.projectId, projectId)
      ))
      .limit(1);

    if (!mainTask.length) {
      return NextResponse.json(
        { error: 'Main task not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the project (any member can view tasks)
    const projectAccess = await db
      .select()
      .from(projects)
      .leftJoin(members, eq(members.projectId, projects.id))
      .where(and(
        eq(projects.id, projectId),
        eq(members.userId, session.user.id)
      ))
      .limit(1);

    if (!projectAccess.length) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get sub-tasks with assigned user details
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
        assignedUserEmail: user.email,
        assignedUserImage: user.image
      })
      .from(subTasks)
      .leftJoin(user, eq(user.id, subTasks.assignedId))
      .where(eq(subTasks.mainTaskId, mainTaskId))
      .orderBy(subTasks.createdAt);

    return NextResponse.json(taskSubTasks);

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/tasks/[taskId]/subtasks - Create new sub-task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
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

    const { id: projectId, taskId: mainTaskId } = await params;

    // Verify main task exists and belongs to project
    const mainTask = await db
      .select()
      .from(mainTasks)
      .where(and(
        eq(mainTasks.id, mainTaskId),
        eq(mainTasks.projectId, projectId)
      ))
      .limit(1);

    if (!mainTask.length) {
      return NextResponse.json(
        { error: 'Main task not found' },
        { status: 404 }
      );
    }

    // Check if user has createTask permission
    const hasPermission = await checkPermission(session.user.id, projectId, 'createTask');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create sub-tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, assignedId, deadline, notificationSettings } = body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Sub-task title is required' },
        { status: 400 }
      );
    }

    if (title.length > 500) {
      return NextResponse.json(
        { error: 'Sub-task title must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Validate assigned user if provided
    if (assignedId) {
      // Check if assigned user is a member of the project
      const assignedMember = await db
        .select()
        .from(members)
        .where(and(
          eq(members.userId, assignedId),
          eq(members.projectId, projectId)
        ))
        .limit(1);

      if (!assignedMember.length) {
        return NextResponse.json(
          { error: 'Assigned user is not a member of this project' },
          { status: 400 }
        );
      }
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

    // Validate notification settings if provided
    if (notificationSettings) {
      const { enabled, daysBefore } = notificationSettings;
      if (enabled) {
        if (!deadlineDate) {
          return NextResponse.json(
            { error: 'Deadline is required when notifications are enabled' },
            { status: 400 }
          );
        }
        if (!assignedId) {
          return NextResponse.json(
            { error: 'Assigned user is required when notifications are enabled' },
            { status: 400 }
          );
        }
        if (!daysBefore || daysBefore < 1 || daysBefore > 30) {
          return NextResponse.json(
            { error: 'daysBefore must be between 1 and 30 when notifications are enabled' },
            { status: 400 }
          );
        }
      }
    }

    // Create sub-task
    const newSubTask = await db.insert(subTasks).values({
      id: createId(),
      mainTaskId: mainTaskId,
      title: title.trim(),
      description: description?.trim() || null,
      assignedId: assignedId || null,
      status: 'pending',
      deadline: deadlineDate,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Schedule notification if enabled and all requirements are met
    let notificationResult = null;
    if (notificationSettings?.enabled && deadlineDate && assignedId && newSubTask[0]) {
      try {
        notificationResult = await scheduleSubTaskNotification({
          subTaskId: newSubTask[0].id,
          daysBefore: notificationSettings.daysBefore,
          createdBy: session.user.id
        });
      } catch (error) {
        console.error('Failed to schedule notification for subtask:', error);
        // Don't fail the whole request if notification scheduling fails
        // The subtask was created successfully
      }
    }

    // Get assigned user details if assigned
    let assignedUser = null;
    if (assignedId) {
      const assignedUserData = await db.select().from(user).where(eq(user.id, assignedId)).limit(1);
      if (assignedUserData.length) {
        assignedUser = assignedUserData[0];
      }
    }

    const response = {
      ...newSubTask[0],
      assignedUserName: assignedUser?.name || null,
      assignedUserEmail: assignedUser?.email || null,
      notification: notificationResult ? {
        scheduled: true,
        notificationId: notificationResult.notificationId,
        daysBefore: notificationSettings.daysBefore
      } : null
    };

    return NextResponse.json(response, { status: 201 });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 