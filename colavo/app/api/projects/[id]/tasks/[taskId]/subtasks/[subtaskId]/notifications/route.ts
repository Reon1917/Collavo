import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireProjectAccess } from '@/lib/auth-helpers';
import { scheduleSubTaskNotification } from '@/lib/notification-scheduler';
import { db } from '@/db';
import { subTasks, mainTasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string; subtaskId: string }> }
): Promise<NextResponse> {
  try {
    // Get session using the correct auth API
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15
    const { id: projectId, taskId, subtaskId } = await params;

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

    // Find the subtask and validate it exists
    const subtaskData = await db
      .select({
        subtask: subTasks,
        mainTask: mainTasks
      })
      .from(subTasks)
      .innerJoin(mainTasks, eq(subTasks.mainTaskId, mainTasks.id))
      .where(and(
        eq(subTasks.id, subtaskId),
        eq(subTasks.mainTaskId, taskId),
        eq(mainTasks.projectId, projectId)
      ))
      .limit(1);

    if (subtaskData.length === 0) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    const subtaskResult = subtaskData[0];
    if (!subtaskResult) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    const { subtask } = subtaskResult;

    // Validate subtask has required fields for notifications
    if (!subtask.deadline) {
      return NextResponse.json({ 
        error: 'Cannot schedule notification for subtask without deadline' 
      }, { status: 400 });
    }

    if (!subtask.assignedId) {
      return NextResponse.json({ 
        error: 'Cannot schedule notification for subtask without assigned member' 
      }, { status: 400 });
    }

    // Schedule notification for the subtask
    try {
      const result = await scheduleSubTaskNotification({
        subTaskId: subtask.id,
        daysBefore: notificationSettings.daysBefore,
        createdBy: session.user.id
      });

      return NextResponse.json({
        success: true,
        message: 'Notification scheduled successfully for subtask',
        notification: {
          id: result.notificationId,
          qstashMessageId: result.qstashMessageId,
          daysBefore: notificationSettings.daysBefore,
          subtaskTitle: subtask.title
        }
      });

    } catch (error) {
      // Failed to schedule subtask notification
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule notification'
      }, { status: 500 });
    }

  } catch {
    // Subtask notification API error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 