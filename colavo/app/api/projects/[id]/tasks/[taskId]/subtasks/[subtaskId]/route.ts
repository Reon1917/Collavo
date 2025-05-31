import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, mainTasks, subTasks, user } from '@/db/schema';
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
      eq(permissions.permission, permission as any),
      eq(permissions.granted, true)
    )).limit(1);

  return memberPermission.length > 0;
}

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

    // Check permissions: user must be the assignee or project leader
    const isAssignee = subtask.assignedId === session.user.id;
    const isLeader = await checkPermission(session.user.id, projectId, 'updateTask') || 
                    await db.select().from(projects).where(and(
                      eq(projects.id, projectId),
                      eq(projects.leaderId, session.user.id)
                    )).then(result => result.length > 0);

    if (!isAssignee && !isLeader) {
      return NextResponse.json(
        { error: 'You can only update subtasks assigned to you or if you are the project leader' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, note, title, description, assignedId, deadline } = body;

    // Validate status if provided
    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, in_progress, or completed' },
        { status: 400 }
      );
    }

    // Validate title if provided
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

    // Validate assigned user if provided
    if (assignedId !== undefined) {
      if (assignedId && assignedId !== subtask.assignedId) {
        // Check if new assigned user is a member of the project
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
    }

    // Validate deadline format if provided
    let deadlineDate = undefined;
    if (deadline !== undefined) {
      if (deadline) {
        deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid deadline format' },
            { status: 400 }
          );
        }
      } else {
        deadlineDate = null;
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (note !== undefined) {
      updateData.note = note?.trim() || null;
    }

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (assignedId !== undefined) {
      updateData.assignedId = assignedId || null;
    }

    if (deadline !== undefined) {
      updateData.deadline = deadlineDate;
    }

    // Update subtask
    const updatedSubTask = await db
      .update(subTasks)
      .set(updateData)
      .where(eq(subTasks.id, subtaskId))
      .returning();

    if (!updatedSubTask.length) {
      return NextResponse.json(
        { error: 'Failed to update subtask' },
        { status: 500 }
      );
    }

    // Get updated subtask with assigned user details
    const updatedSubTaskWithUser = await db
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
      .where(eq(subTasks.id, subtaskId))
      .limit(1);

    return NextResponse.json(updatedSubTaskWithUser[0]);

  } catch (error) {
    console.error('Error updating subtask:', error);
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

    // Check permissions: only project leader can delete subtasks
    const isLeader = await db.select().from(projects).where(and(
      eq(projects.id, projectId),
      eq(projects.leaderId, session.user.id)
    )).then(result => result.length > 0);

    if (!isLeader) {
      return NextResponse.json(
        { error: 'Only project leaders can delete subtasks' },
        { status: 403 }
      );
    }

    // Delete subtask
    await db.delete(subTasks).where(eq(subTasks.id, subtaskId));

    return NextResponse.json({ 
      message: 'Subtask deleted successfully',
      subtaskId: subtaskId 
    });

  } catch (error) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 