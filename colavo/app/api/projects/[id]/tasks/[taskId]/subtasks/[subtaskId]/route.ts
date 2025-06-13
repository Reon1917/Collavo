import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { mainTasks, subTasks, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireProjectAccess } from '@/lib/auth-helpers';

// PATCH /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId] - Update subtask
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string; subtaskId: string }> }
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

    const { id: projectId, taskId: mainTaskId, subtaskId } = await params;

    // Use centralized access control
    const access = await requireProjectAccess(session.user.id, projectId);

    // Verify subtask exists and belongs to the main task and project
    const existingSubTask = await db
      .select({
        id: subTasks.id,
        title: subTasks.title,
        assignedId: subTasks.assignedId,
        status: subTasks.status,
        note: subTasks.note,
        projectId: mainTasks.projectId
      })
      .from(subTasks)
      .innerJoin(mainTasks, eq(mainTasks.id, subTasks.mainTaskId))
      .where(and(
        eq(subTasks.id, subtaskId),
        eq(subTasks.mainTaskId, mainTaskId),
        eq(mainTasks.projectId, projectId)
      ))
      .limit(1);

    if (!existingSubTask.length) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }

    const subtask = existingSubTask[0];
    if (!subtask) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }

    // Check permissions based on the new permission system:
    // - Assignees can update status and notes
    // - Users with updateTask permission can update status and notes of all subtasks
    // - Users with handleTask permission can fully edit all subtasks (title, description, assignment, etc.)
    const isAssignee = subtask.assignedId === session.user.id;
    const canUpdateStatus = isAssignee || access.isLeader || access.permissions.includes('updateTask');
    const canEditDetails = access.isLeader || access.permissions.includes('handleTask');

    // Check if user has any permission to modify this subtask
    if (!canUpdateStatus && !canEditDetails) {
      return NextResponse.json(
        { error: 'You do not have permission to update this subtask' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, status, note, deadline, assignedId } = body;

    // Validate input
    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Subtask title is required' },
          { status: 400 }
        );
      }
      if (title.length > 500) {
        return NextResponse.json(
          { error: 'Subtask title must be less than 500 characters' },
          { status: 400 }
        );
      }
    }

    if (status !== undefined && !['pending', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, in_progress, or completed' },
        { status: 400 }
      );
    }

    // Validate deadline format if provided
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

    // Update logic based on permissions:
    // - Assignees without other permissions can only update status and note of their assigned subtasks
    // - Users with updateTask permission can update status and note of ANY subtask
    // - Users with handleTask permission can update ALL fields of ANY subtask
    const updateData: any = {
      updatedAt: new Date()
    };

    if (canUpdateStatus && !canEditDetails && isAssignee) {
      // Regular assignee can only update status and note
      if (status !== undefined) updateData.status = status;
      if (note !== undefined) updateData.note = note?.trim() || null;
    } else if (canUpdateStatus && !canEditDetails && access.permissions.includes('updateTask')) {
      // Users with updateTask permission can update status and note of any subtask
      if (status !== undefined) updateData.status = status;
      if (note !== undefined) updateData.note = note?.trim() || null;
    } else if (canEditDetails) {
      // Leaders and users with handleTask permission can update all fields
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description?.trim() || null;
      if (status !== undefined) updateData.status = status;
      if (note !== undefined) updateData.note = note?.trim() || null;
      if (deadline !== undefined) updateData.deadline = deadlineDate;
      if (assignedId !== undefined) updateData.assignedId = assignedId;
    }

    // Update subtask
    const updatedSubTask = await db
      .update(subTasks)
      .set(updateData)
      .where(eq(subTasks.id, subtaskId))
      .returning();

    if (!updatedSubTask.length || !updatedSubTask[0]) {
      return NextResponse.json(
        { error: 'Failed to update subtask' },
        { status: 500 }
      );
    }

    // Get assigned user details for response
    let assignedUser = null;
    if (updatedSubTask[0].assignedId) {
      const assignedUserResult = await db
        .select({
          name: user.name,
          email: user.email
        })
        .from(user)
        .where(eq(user.id, updatedSubTask[0].assignedId))
        .limit(1);

      if (assignedUserResult.length > 0) {
        assignedUser = assignedUserResult[0];
      }
    }

    return NextResponse.json({
      ...updatedSubTask[0],
      assignedUserName: assignedUser?.name || null,
      assignedUserEmail: assignedUser?.email || null
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
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId] - Delete subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string; subtaskId: string }> }
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

    const { id: projectId, taskId: mainTaskId, subtaskId } = await params;

    // Verify subtask exists and belongs to the main task and project
    const existingSubTask = await db
      .select({
        id: subTasks.id,
        title: subTasks.title,
        assignedId: subTasks.assignedId,
        projectId: mainTasks.projectId
      })
      .from(subTasks)
      .innerJoin(mainTasks, eq(mainTasks.id, subTasks.mainTaskId))
      .where(and(
        eq(subTasks.id, subtaskId),
        eq(subTasks.mainTaskId, mainTaskId),
        eq(mainTasks.projectId, projectId)
      ))
      .limit(1);

    if (!existingSubTask.length) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }

    const subtask = existingSubTask[0];
    if (!subtask) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }

    // Check permissions: project leader or users with handleTask permission can delete subtasks
    const access = await requireProjectAccess(session.user.id, projectId);
    const canDeleteSubtask = access.isLeader || access.permissions.includes('handleTask');

    if (!canDeleteSubtask) {
      return NextResponse.json(
        { error: 'You do not have permission to delete subtasks' },
        { status: 403 }
      );
    }

    // Delete subtask
    await db.delete(subTasks).where(eq(subTasks.id, subtaskId));

    return NextResponse.json({ 
      message: 'Subtask deleted successfully',
      subtaskId: subtaskId 
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 