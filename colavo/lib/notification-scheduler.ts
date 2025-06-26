import { eq, and, gte, lte } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/db';
import { scheduledNotifications, subTasks, mainTasks, projects, user, events } from '@/db/schema';
import { 
  qstash, 
  calculateNotificationDate, 
  calculateQStashDelay, 
  validateNotificationTiming 
} from './qstash-client';
import type { ScheduleSubTaskNotificationParams, ScheduleEventNotificationParams } from '@/types';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/send-notification`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api/webhooks/send-notification`
  : (() => {
      throw new Error('Either NEXT_PUBLIC_APP_URL or VERCEL_URL environment variable is required for notification scheduling');
    })();
// Note: IS_DEVELOPMENT and IS_LOCALHOST were removed as they're now handled in qstash-client

/**
 * Schedule notification for a subtask
 */
export async function scheduleSubTaskNotification(
  params: ScheduleSubTaskNotificationParams
): Promise<{ notificationId: string; qstashMessageId: string }> {
  const { subTaskId, daysBefore, notificationTime = "09:00", createdBy, customScheduledFor } = params;

  try {
    // Get subtask with related data
    const subtaskData = await db
      .select({
        subtask: subTasks,
        mainTask: mainTasks,
        project: projects,
        assignedUser: user,
      })
      .from(subTasks)
      .innerJoin(mainTasks, eq(subTasks.mainTaskId, mainTasks.id))
      .innerJoin(projects, eq(mainTasks.projectId, projects.id))
      .leftJoin(user, eq(subTasks.assignedId, user.id))
      .where(eq(subTasks.id, subTaskId))
      .limit(1);

    if (!subtaskData[0]) {
      throw new Error(`Subtask ${subTaskId} not found`);
    }

    const { subtask, project, assignedUser } = subtaskData[0];

    if (!subtask.deadline) {
      throw new Error('Cannot schedule notification for subtask without deadline');
    }

    if (!assignedUser) {
      throw new Error('Cannot schedule notification for subtask without assigned user');
    }

    // Calculate notification date (use custom date for testing, or calculate normally)
    const notificationDate = customScheduledFor || calculateNotificationDate(subtask.deadline, daysBefore, notificationTime);
    
    // Validate timing (skip validation for custom dates in testing)
    if (!customScheduledFor) {
      validateNotificationTiming(notificationDate);
    }

    // Create database record first
    const notificationId = createId();
    await db.insert(scheduledNotifications).values({
      id: notificationId,
      type: 'subtask',
      entityId: subTaskId,
      recipientUserId: assignedUser.id,
      scheduledFor: notificationDate,
      daysBefore,
      status: 'pending',
      createdBy,
      projectId: project.id,
    });

    let qstashMessageId: string;

    // Check if QStash is available
    if (!qstash) {
      // Mock QStash response for development when QStash is not configured
      qstashMessageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[DEV] Mock notification scheduled (QStash not configured):`, {
        notificationId,
        type: 'subtask',
        entityId: subTaskId,
        scheduledFor: notificationDate,
        delay: `${Math.round((notificationDate.getTime() - Date.now()) / 1000 / 60)} minutes`
      });
    } else {
      // Calculate delay for QStash
      const delay = calculateQStashDelay(notificationDate);

      // Schedule with QStash (production or development server)
      const qstashResponse = await qstash!.publishJSON({
        url: WEBHOOK_URL,
        body: {
          notificationId,
          type: 'subtask',
          entityId: subTaskId,
        },
        delay: delay,
        headers: {
          'Content-Type': 'application/json',
        },
        // Deduplication to prevent duplicates
        deduplicationId: `subtask-${subTaskId}-${daysBefore}days-${Date.now()}`,
        retries: 3,
      });

      qstashMessageId = qstashResponse.messageId;
      
      console.log(`[QStash] Notification scheduled:`, {
        notificationId,
        qstashMessageId,
        type: 'subtask',
        entityId: subTaskId,
        scheduledFor: notificationDate,
        webhookUrl: WEBHOOK_URL
      });
    }

    // Update database with QStash message ID
    await db
      .update(scheduledNotifications)
      .set({ qstashMessageId })
      .where(eq(scheduledNotifications.id, notificationId));

    // Scheduled subtask notification

    return {
      notificationId,
      qstashMessageId,
    };

  } catch (error) {
    // Failed to schedule subtask notification
    throw error;
  }
}

/**
 * Schedule notification for an event
 */
export async function scheduleEventNotification(
  params: ScheduleEventNotificationParams
): Promise<{ notificationId: string; qstashMessageId: string }> {
  const { eventId, daysBefore, notificationTime = "09:00", recipientUserIds, createdBy, customScheduledFor } = params;

  try {
    // Get event with related data
    const eventData = await db
      .select({
        event: events,
        project: projects,
      })
      .from(events)
      .innerJoin(projects, eq(events.projectId, projects.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (!eventData[0]) {
      throw new Error(`Event ${eventId} not found`);
    }

    const { event, project } = eventData[0];

    if (!recipientUserIds.length) {
      throw new Error('Cannot schedule notification without recipients');
    }

    // Calculate notification date (use custom date for testing, or calculate normally)
    const notificationDate = customScheduledFor || calculateNotificationDate(event.datetime, daysBefore, notificationTime);
    
    // Validate timing (skip validation for custom dates in testing)
    if (!customScheduledFor) {
      validateNotificationTiming(notificationDate);
    }

    // Create database record first
    const notificationId = createId();
    await db.insert(scheduledNotifications).values({
      id: notificationId,
      type: 'event',
      entityId: eventId,
      recipientUserIds: recipientUserIds,
      scheduledFor: notificationDate,
      daysBefore,
      status: 'pending',
      createdBy,
      projectId: project.id,
    });

    let qstashMessageId: string;

    // Check if QStash is available
    if (!qstash) {
      // Mock QStash response for development when QStash is not configured
      qstashMessageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[DEV] Mock notification scheduled (QStash not configured):`, {
        notificationId,
        type: 'event',
        entityId: eventId,
        scheduledFor: notificationDate,
        delay: `${Math.round((notificationDate.getTime() - Date.now()) / 1000 / 60)} minutes`
      });
    } else {
      // Calculate delay for QStash
      const delay = calculateQStashDelay(notificationDate);

      // Schedule with QStash (production or development server)
      const qstashResponse = await qstash.publishJSON({
        url: WEBHOOK_URL,
        body: {
          notificationId,
          type: 'event',
          entityId: eventId,
        },
        delay: delay,
        headers: {
          'Content-Type': 'application/json',
        },
        // Deduplication to prevent duplicates
        deduplicationId: `event-${eventId}-${daysBefore}days-${Date.now()}`,
        retries: 3,
      });

      qstashMessageId = qstashResponse.messageId;
      
      console.log(`[QStash] Notification scheduled:`, {
        notificationId,
        qstashMessageId,
        type: 'event',
        entityId: eventId,
        scheduledFor: notificationDate,
        webhookUrl: WEBHOOK_URL
      });
    }

    // Update database with QStash message ID
    await db
      .update(scheduledNotifications)
      .set({ qstashMessageId })
      .where(eq(scheduledNotifications.id, notificationId));

    // Scheduled event notification

    return {
      notificationId,
      qstashMessageId,
    };

  } catch (error) {
    // Failed to schedule event notification
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  try {
    // Get notification from database
    const notification = await db
      .select()
      .from(scheduledNotifications)
      .where(eq(scheduledNotifications.id, notificationId))
      .limit(1);

    if (!notification[0]) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    const notif = notification[0];

    if (notif.status !== 'pending') {
      throw new Error(`Cannot cancel notification with status: ${notif.status}`);
    }

    // Try to cancel in QStash (if message ID exists and not a mock)
    if (notif.qstashMessageId && !notif.qstashMessageId.startsWith('mock-')) {
      try {
        if (qstash) {
          await qstash.messages.delete(notif.qstashMessageId);
          // Cancelled QStash message
        } else {
          console.warn(`[DEV] Cannot cancel QStash message - QStash not configured`);
        }
      } catch {
        // Message might already be processed or doesn't exist
        // Could not cancel QStash message
      }
    } else if (notif.qstashMessageId?.startsWith('mock-')) {
      // Mock cancellation for development
      console.log(`[DEV] Mock notification cancelled:`, notif.qstashMessageId);
    }

    // Update status in database
    await db
      .update(scheduledNotifications)
      .set({ 
        status: 'cancelled',
        // Keep the original qstashMessageId for audit trail
      })
      .where(eq(scheduledNotifications.id, notificationId));

    // Cancelled notification

  } catch (error) {
    // Failed to cancel notification
    throw error;
  }
}

/**
 * Cancel all notifications for a specific entity (subtask or event)
 */
export async function cancelNotificationsForEntity(
  entityId: string, 
  type: 'subtask' | 'event'
): Promise<number> {
  try {
    // Get all pending notifications for this entity
    const notifications = await db
      .select()
      .from(scheduledNotifications)
      .where(
        and(
          eq(scheduledNotifications.entityId, entityId),
          eq(scheduledNotifications.type, type),
          eq(scheduledNotifications.status, 'pending')
        )
      );

    let cancelledCount = 0;

    for (const notification of notifications) {
      try {
        await cancelScheduledNotification(notification.id);
        cancelledCount++;
      } catch {
        // Failed to cancel individual notification
      }
    }

    // Cancelled notifications for entity
    return cancelledCount;

  } catch (error) {
    // Failed to cancel notifications for entity
    throw error;
  }
}

/**
 * Get scheduled notifications for a project
 */
export async function getProjectNotifications(projectId: string) {
  return await db
    .select({
      notification: scheduledNotifications,
      project: projects,
    })
    .from(scheduledNotifications)
    .innerJoin(projects, eq(scheduledNotifications.projectId, projects.id))
    .where(eq(scheduledNotifications.projectId, projectId))
    .orderBy(scheduledNotifications.scheduledFor);
}

/**
 * Get notifications that are about to be sent (for monitoring)
 */
export async function getUpcomingNotifications(hoursAhead: number = 24) {
  const now = new Date();
  const futureTime = new Date();
  futureTime.setHours(futureTime.getHours() + hoursAhead);

  return await db
    .select()
    .from(scheduledNotifications)
    .where(
      and(
        eq(scheduledNotifications.status, 'pending'),
        gte(scheduledNotifications.scheduledFor, now),
        lte(scheduledNotifications.scheduledFor, futureTime)
      )
    )
    .orderBy(scheduledNotifications.scheduledFor);
} 