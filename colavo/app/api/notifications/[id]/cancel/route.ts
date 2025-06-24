import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { scheduledNotifications, members } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { qstashClient } from '@/lib/qstash-client';

/**
 * Cancel a scheduled notification
 * DELETE /api/notifications/[id]/cancel
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: notificationId } = await params;

    // Get the notification
    const notificationResult = await db
      .select({
        id: scheduledNotifications.id,
        status: scheduledNotifications.status,
        qstashMessageId: scheduledNotifications.qstashMessageId,
        projectId: scheduledNotifications.projectId,
        createdBy: scheduledNotifications.createdBy,
      })
      .from(scheduledNotifications)
      .where(eq(scheduledNotifications.id, notificationId))
      .limit(1);

    if (notificationResult.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const notification = notificationResult[0];

    // Check if notification can be cancelled
    if (notification.status !== 'pending') {
      return NextResponse.json({ 
        error: `Cannot cancel notification with status: ${notification.status}` 
      }, { status: 400 });
    }

    // Check if user has permission to cancel this notification
    // User must be either the creator or a project member with appropriate permissions
    const userAccess = await db
      .select()
      .from(members)
      .where(and(
        eq(members.userId, session.user.id),
        eq(members.projectId, notification.projectId!)
      ))
      .limit(1);

    const isCreator = notification.createdBy === session.user.id;
    const hasProjectAccess = userAccess.length > 0;

    if (!isCreator && !hasProjectAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Cancel the QStash message if it exists
    if (notification.qstashMessageId) {
      try {
        await qstashClient.messages.delete(notification.qstashMessageId);
      } catch (error) {
        console.error('Failed to cancel QStash message:', error);
        // Continue with database update even if QStash cancellation fails
        // The message might have already been processed or deleted
      }
    }

    // Update notification status in database
    const updateResult = await db
      .update(scheduledNotifications)
      .set({ 
        status: 'cancelled'
      })
      .where(eq(scheduledNotifications.id, notificationId))
      .returning();

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Failed to update notification status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification cancelled successfully',
      notificationId: notificationId,
      status: 'cancelled'
    });

  } catch (error) {
    console.error('Error cancelling notification:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
} 