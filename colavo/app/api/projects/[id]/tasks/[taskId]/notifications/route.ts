import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireProjectAccess } from '@/lib/auth-helpers';
import { scheduleSubTaskNotification } from '@/lib/notification-scheduler';
import { db } from '@/lib/db';
import { mainTasks, subTasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const taskId = params.taskId;

    // Check project access
    const projectAccess = await requireProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { notificationSettings } = body;

    if (!notificationSettings?.enabled) {
      return NextResponse.json({ error: 'Notification settings must be enabled' }, { status: 400 });
    }

    // Validate notification settings
    if (typeof notificationSettings.daysBefore !== 'number' || 
        notificationSettings.daysBefore < 1 || 
        notificationSettings.daysBefore > 30) {
      return NextResponse.json({ 
        error: 'daysBefore must be between 1 and 30 when notifications are enabled' 
      }, { status: 400 });
    }

    // Find the task and its subtasks
    const [mainTask] = await db
      .select()
      .from(mainTasks)
      .where(and(eq(mainTasks.id, taskId), eq(mainTasks.projectId, projectId)))
      .limit(1);

    if (!mainTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get task subtasks
    const taskSubTasks = await db
      .select()
      .from(subTasks)
      .where(eq(subTasks.mainTaskId, mainTask.id));

    if (taskSubTasks.length === 0) {
      return NextResponse.json({ error: 'No subtasks found for this task' }, { status: 400 });
    }

    // Schedule notifications for each subtask that has a deadline and assignee
    const notificationResults = [];
    
    for (const subtask of taskSubTasks) {
      if (subtask.deadline && subtask.assignedTo) {
        try {
          const notificationId = await scheduleSubTaskNotification(
            subtask.id,
            notificationSettings.daysBefore
          );
          
          notificationResults.push({
            subtaskId: subtask.id,
            subtaskTitle: subtask.title,
            notificationId,
            status: 'scheduled'
          });
        } catch (error) {
          console.error(`Failed to schedule notification for subtask ${subtask.id}:`, error);
          notificationResults.push({
            subtaskId: subtask.id,
            subtaskTitle: subtask.title,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
          });
        }
      } else {
        notificationResults.push({
          subtaskId: subtask.id,
          subtaskTitle: subtask.title,
          status: 'skipped',
          reason: !subtask.deadline ? 'No deadline' : 'No assignee'
        });
      }
    }

    const scheduledCount = notificationResults.filter(r => r.status === 'scheduled').length;
    const failedCount = notificationResults.filter(r => r.status === 'failed').length;
    const skippedCount = notificationResults.filter(r => r.status === 'skipped').length;

    return NextResponse.json({
      success: true,
      message: `Processed ${taskSubTasks.length} subtasks: ${scheduledCount} scheduled, ${skippedCount} skipped, ${failedCount} failed`,
      results: notificationResults,
      summary: {
        total: taskSubTasks.length,
        scheduled: scheduledCount,
        skipped: skippedCount,
        failed: failedCount
      }
    });

  } catch (error) {
    console.error('Error setting up task notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 