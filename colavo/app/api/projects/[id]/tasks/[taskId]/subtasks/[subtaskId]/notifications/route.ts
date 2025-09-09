import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/auth-helpers';
import { NotificationService } from '@/lib/email/notification-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string; subtaskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, subtaskId } = await params;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get notifications for subtask
    const notifications = await NotificationService.getSubtaskNotifications(subtaskId);

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string; subtaskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, subtaskId } = await params;
    const body = await request.json();
    const { daysBefore, time } = body;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check permission to manage subtask notifications
    // Only project leader or assigned member can set notifications
    const { db } = await import('@/db');
    const { subTasks, projects } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');

    // Get subtask details
    const subtask = await db
      .select({
        assignedId: subTasks.assignedId,
        projectId: subTasks.mainTaskId // we'll need to get project through main task
      })
      .from(subTasks)
      .where(eq(subTasks.id, subtaskId))
      .limit(1);

    if (!subtask.length) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    // Check if user is project leader
    const project = await db
      .select({ leaderId: projects.leaderId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    const isLeader = project[0]?.leaderId === session.user.id;
    const isAssigned = subtask[0].assignedId === session.user.id;

    if (!isLeader && !isAssigned) {
      return NextResponse.json(
        { error: 'Only the assigned member or project leader can manage subtask notifications' },
        { status: 403 }
      );
    }

    // Validate input
    if (!daysBefore || !time) {
      return NextResponse.json(
        { error: 'daysBefore and time are required' },
        { status: 400 }
      );
    }

    if (daysBefore < 1 || daysBefore > 30) {
      return NextResponse.json(
        { error: 'daysBefore must be between 1 and 30' },
        { status: 400 }
      );
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format' },
        { status: 400 }
      );
    }

    // Create notification
    const notificationId = await NotificationService.createSubtaskNotification({
      subtaskId,
      userId: session.user.id,
      daysBefore,
      time,
      projectId,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      notificationId,
      message: 'Notification scheduled successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 