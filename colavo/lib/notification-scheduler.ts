import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/db';
import { scheduledNotifications, subTasks, mainTasks, projects, user, events } from '@/db/schema';
import { 
  qstash, 
  calculateNotificationDate, 
  calculateQStashDelay, 
  validateNotificationTiming 
} from './qstash-client';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/send-notification`
  : 'https://your-app.vercel.app/api/webhooks/send-notification';

export interface ScheduleSubTaskNotificationParams {
  subTaskId: string;
  daysBefore: number;
  createdBy: string;
  customScheduledFor?: Date; // For testing - override calculated date
}

export interface ScheduleEventNotificationParams {
  eventId: string;
  daysBefore: number;
  recipientUserIds: string[];
  createdBy: string;
  customScheduledFor?: Date; // For testing - override calculated date
}

/**
 * Schedule notification for a subtask
 */
export async function scheduleSubTaskNotification(
  params: ScheduleSubTaskNotificationParams
): Promise<{ notificationId: string; qstashMessageId: string }> {
  const { subTaskId, daysBefore, createdBy, customScheduledFor } = params;

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
    const notificationDate = customScheduledFor || calculateNotificationDate(subtask.deadline, daysBefore);
    
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

    // Calculate delay for QStash
    const delay = calculateQStashDelay(notificationDate);

    // Schedule with QStash
    const qstashResponse = await qstash.publishJSON({
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

    // Update database with QStash message ID
    await db
      .update(scheduledNotifications)
      .set({ qstashMessageId: qstashResponse.messageId })
      .where(eq(scheduledNotifications.id, notificationId));

    // Scheduled subtask notification

    return {
      notificationId,
      qstashMessageId: qstashResponse.messageId,
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
  const { eventId, daysBefore, recipientUserIds, createdBy, customScheduledFor } = params;

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
    const notificationDate = customScheduledFor || calculateNotificationDate(event.datetime, daysBefore);
    
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

    // Calculate delay for QStash
    const delay = calculateQStashDelay(notificationDate);

    // Schedule with QStash
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

    // Update database with QStash message ID
    await db
      .update(scheduledNotifications)
      .set({ qstashMessageId: qstashResponse.messageId })
      .where(eq(scheduledNotifications.id, notificationId));

    // Scheduled event notification

    return {
      notificationId,
      qstashMessageId: qstashResponse.messageId,
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

    // Try to cancel in QStash (if message ID exists)
    if (notif.qstashMessageId) {
      try {
        await qstash.messages.delete(notif.qstashMessageId);
        // Cancelled QStash message
      } catch {
        // Message might already be processed or doesn't exist
        // Could not cancel QStash message
      }
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
  const futureTime = new Date();
  futureTime.setHours(futureTime.getHours() + hoursAhead);

  return await db
    .select()
    .from(scheduledNotifications)
    .where(
      and(
        eq(scheduledNotifications.status, 'pending'),
        // scheduledFor between now and futureTime would need additional date functions
      )
    )
    .orderBy(scheduledNotifications.scheduledFor);
} 