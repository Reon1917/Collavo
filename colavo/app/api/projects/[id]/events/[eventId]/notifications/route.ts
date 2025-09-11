import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/auth-helpers';
import { NotificationService } from '@/lib/email/notification-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, eventId } = await params;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get notifications for event
    const notifications = await NotificationService.getEventNotifications(eventId);

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
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, eventId } = await params;
    const body = await request.json();
    const { recipientUserIds, daysBefore, time } = body;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check permission to manage event notifications
    // Only project leader or members with handleEvent permission can set event notifications
    const { checkPermissionDetailed } = await import('@/lib/auth-helpers');
    
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'handleEvent');
    
    if (!permissionCheck.hasPermission) {
      return NextResponse.json(
        { error: 'You need event management permissions to set up event notifications' },
        { status: 403 }
      );
    }

    // Validate input
    if (!recipientUserIds || !Array.isArray(recipientUserIds) || !recipientUserIds.length) {
      return NextResponse.json(
        { error: 'recipientUserIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (daysBefore === undefined || daysBefore === null || !time) {
      return NextResponse.json(
        { error: 'daysBefore and time are required' },
        { status: 400 }
      );
    }

    if (daysBefore < 0 || daysBefore > 30) {
      return NextResponse.json(
        { error: 'daysBefore must be between 0 and 30' },
        { status: 400 }
      );
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format' },
        { status: 400 }
      );
    }

    // Create notifications
    const notificationIds = await NotificationService.createEventNotification({
      eventId,
      recipientUserIds,
      daysBefore,
      time,
      projectId,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      notificationIds,
      message: `${notificationIds.length} notification(s) scheduled successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 