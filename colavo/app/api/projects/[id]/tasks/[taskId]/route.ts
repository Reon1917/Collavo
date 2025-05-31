import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, permissions, mainTasks } from '@/db/schema';
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

// DELETE /api/projects/[id]/tasks/[taskId] - Delete main task
export async function DELETE(
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

    const { id: projectId, taskId } = await params;

    // Verify task exists and belongs to project
    const existingTask = await db
      .select({
        id: mainTasks.id,
        title: mainTasks.title,
        createdBy: mainTasks.createdBy,
        projectId: mainTasks.projectId
      })
      .from(mainTasks)
      .where(and(
        eq(mainTasks.id, taskId),
        eq(mainTasks.projectId, projectId)
      ))
      .limit(1);

    if (!existingTask.length) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = existingTask[0];
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check permissions: user must be project leader, have updateTask permission, or be the task creator
    const isLeader = await db.select().from(projects).where(and(
      eq(projects.id, projectId),
      eq(projects.leaderId, session.user.id)
    )).then(result => result.length > 0);

    const hasUpdatePermission = await checkPermission(session.user.id, projectId, 'updateTask');
    const isCreator = task.createdBy === session.user.id;

    if (!isLeader && !hasUpdatePermission && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this task' },
        { status: 403 }
      );
    }

    // Delete task (cascade will handle subtasks)
    await db.delete(mainTasks).where(eq(mainTasks.id, taskId));

    return NextResponse.json({ 
      message: 'Task deleted successfully',
      taskId: taskId 
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 