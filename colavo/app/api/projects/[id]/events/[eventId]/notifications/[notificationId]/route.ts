import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/auth-helpers';
import { NotificationService } from '@/lib/email/notification-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; notificationId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, notificationId } = await params;
    const body = await request.json();
    const { daysBefore, time } = body;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate input
    if (daysBefore !== undefined && (daysBefore < 0 || daysBefore > 30)) {
      return NextResponse.json(
        { error: 'daysBefore must be between 0 and 30' },
        { status: 400 }
      );
    }

    if (time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format' },
        { status: 400 }
      );
    }

    // Update notification
    await NotificationService.updateNotification(notificationId, {
      daysBefore,
      time,
    });

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; notificationId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, notificationId } = await params;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Cancel notification
    await NotificationService.cancelNotification(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification cancelled successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 