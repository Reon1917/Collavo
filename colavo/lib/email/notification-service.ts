import { db } from '@/db';
import { scheduledNotifications, subTasks, mainTasks, events, user, projects } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { ResendEmailService } from './resend-service';
import { generateSubtaskReminderTemplate } from './templates/subtask-reminder';
import { generateEventReminderTemplate } from './templates/event-reminder';
import { calculateScheduleTime, isPastTime } from '@/utils/timezone';

export interface CreateSubtaskNotificationParams {
  subtaskId: string;
  userId: string;
  daysBefore: number;
  time: string; // "09:00" format
  projectId: string;
  createdBy: string;
}

export interface CreateEventNotificationParams {
  eventId: string;
  recipientUserIds: string[];
  daysBefore: number;
  time: string; // "09:00" format
  projectId: string;
  createdBy: string;
}

export interface UpdateNotificationParams {
  daysBefore?: number;
  time?: string;
}

/**
 * Notification service for managing email notifications
 */
export class NotificationService {
  /**
   * Create subtask notification
   */
  static async createSubtaskNotification(params: CreateSubtaskNotificationParams): Promise<string> {
    const { subtaskId, userId, daysBefore, time, projectId, createdBy } = params;

    // Get subtask details with related data
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
      .where(eq(subTasks.id, subtaskId))
      .limit(1);

    if (!subtaskData.length) {
      throw new Error('Subtask not found');
    }

    const subtaskRecord = subtaskData[0]!;

    if (!subtaskRecord.subtask.deadline) {
      throw new Error('Subtask must have a deadline to schedule notifications');
    }

    if (!subtaskRecord.assignedUser) {
      throw new Error('Subtask must be assigned to a user');
    }

    // Calculate scheduled time
    const scheduledFor = calculateScheduleTime(subtaskRecord.subtask.deadline, daysBefore, time);

    // Check if scheduled time is in the past
    if (isPastTime(scheduledFor)) {
      throw new Error('Cannot schedule notification for past time');
    }

    // Generate email content
    const emailHtml = generateSubtaskReminderTemplate({
      userName: subtaskRecord.assignedUser.name,
      subtaskTitle: subtaskRecord.subtask.title,
      deadline: subtaskRecord.subtask.deadline,
      projectName: subtaskRecord.project.name,
      daysRemaining: daysBefore,
      projectId,
      subtaskId,
    });

    const subject = `Reminder: ${subtaskRecord.subtask.title} deadline in ${daysBefore} ${daysBefore === 1 ? 'day' : 'days'}`;

    // Schedule email with Resend
    const { emailId } = await ResendEmailService.scheduleNotification({
      recipientEmails: [subtaskRecord.assignedUser.email],
      subject,
      html: emailHtml,
      scheduledAt: scheduledFor,
    });

    // Save notification record
    const notificationId = createId();
    await db.insert(scheduledNotifications).values({
      id: notificationId,
      type: 'subtask',
      entityId: subtaskId,
      recipientUserId: userId,
      scheduledFor,
      daysBefore,
      status: 'pending',
      emailId,
      createdBy,
      projectId,
    });

    return notificationId;
  }

  /**
   * Create event notification for multiple users
   */
  static async createEventNotification(params: CreateEventNotificationParams): Promise<string[]> {
    const { eventId, recipientUserIds, daysBefore, time, projectId, createdBy } = params;

    // Get event details
    const eventData = await db
      .select({
        event: events,
        project: projects,
      })
      .from(events)
      .innerJoin(projects, eq(events.projectId, projects.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (!eventData.length) {
      throw new Error('Event not found');
    }

    const eventRecord = eventData[0]!;

    // Calculate scheduled time
    const scheduledFor = calculateScheduleTime(eventRecord.event.datetime, daysBefore, time);

    // Check if scheduled time is in the past
    if (isPastTime(scheduledFor)) {
      throw new Error('Cannot schedule notification for past time');
    }

    // Get recipient user details
    const recipients = await db
      .select()
      .from(user)
      .where(inArray(user.id, recipientUserIds));

    if (recipients.length !== recipientUserIds.length) {
      throw new Error('Some recipient users not found');
    }

    const notificationIds: string[] = [];

    // Create individual notifications for each recipient (since Resend doesn't support batch scheduling)
    for (const recipient of recipients) {
      // Generate email content
      const templateParams: any = {
        userName: recipient.name,
        eventTitle: eventRecord.event.title,
        eventDate: eventRecord.event.datetime,
        projectName: eventRecord.project.name,
        projectId,
        eventId,
        daysRemaining: daysBefore,
      };
      
      if (eventRecord.event.location) {
        templateParams.location = eventRecord.event.location;
      }
      
      if (eventRecord.event.description) {
        templateParams.description = eventRecord.event.description;
      }
      
      const emailHtml = generateEventReminderTemplate(templateParams);

      const subject = `Event Reminder: ${eventRecord.event.title} in ${daysBefore} ${daysBefore === 1 ? 'day' : 'days'}`;

      // Schedule email with Resend
      const { emailId } = await ResendEmailService.scheduleNotification({
        recipientEmails: [recipient.email],
        subject,
        html: emailHtml,
        scheduledAt: scheduledFor,
      });

      // Save notification record
      const notificationId = createId();
      await db.insert(scheduledNotifications).values({
        id: notificationId,
        type: 'event',
        entityId: eventId,
        recipientUserId: recipient.id,
        scheduledFor,
        daysBefore,
        status: 'pending',
        emailId,
        createdBy,
        projectId,
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  }

  /**
   * Cancel notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    // Get notification details
    const notification = await db
      .select()
      .from(scheduledNotifications)
      .where(eq(scheduledNotifications.id, notificationId))
      .limit(1);

    if (!notification.length) {
      throw new Error('Notification not found');
    }

    const notificationData = notification[0]!;

    if (notificationData.status === 'sent') {
      throw new Error('Cannot cancel notification that has already been sent');
    }

    if (notificationData.status === 'cancelled') {
      throw new Error('Notification is already cancelled');
    }

    // Cancel with Resend if emailId exists
    if (notificationData.emailId) {
      try {
        await ResendEmailService.cancelNotification(notificationData.emailId);
      } catch (error) {
        // Log error but don't fail the operation since the notification might already be processed
      }
    }

    // Update notification status
    await db
      .update(scheduledNotifications)
      .set({ status: 'cancelled' })
      .where(eq(scheduledNotifications.id, notificationId));
  }

  /**
   * Update notification timing
   */
  static async updateNotification(
    notificationId: string,
    params: UpdateNotificationParams
  ): Promise<void> {
    const { daysBefore, time } = params;

    if (!daysBefore && !time) {
      throw new Error('At least one parameter (daysBefore or time) must be provided');
    }

    // Get notification with related data
    const notificationData = await db
      .select({
        notification: scheduledNotifications,
        subtask: subTasks,
        event: events,
      })
      .from(scheduledNotifications)
      .leftJoin(subTasks, eq(scheduledNotifications.entityId, subTasks.id))
      .leftJoin(events, eq(scheduledNotifications.entityId, events.id))
      .where(eq(scheduledNotifications.id, notificationId))
      .limit(1);

    if (!notificationData.length) {
      throw new Error('Notification not found');
    }

    const notificationRecord = notificationData[0]!;

    if (notificationRecord.notification.status === 'sent') {
      throw new Error('Cannot update notification that has already been sent');
    }

    if (notificationRecord.notification.status === 'cancelled') {
      throw new Error('Cannot update cancelled notification');
    }

    // Determine the deadline based on notification type
    const deadline = notificationRecord.notification.type === 'subtask' 
      ? notificationRecord.subtask?.deadline 
      : notificationRecord.event?.datetime;

    if (!deadline) {
      throw new Error('Cannot find deadline for notification');
    }

    // Calculate new scheduled time
    const newDaysBefore = daysBefore ?? notificationRecord.notification.daysBefore;
    const newTime = time ?? '09:00'; // Default time if not provided
    const newScheduledFor = calculateScheduleTime(deadline, newDaysBefore, newTime);

    // Check if new scheduled time is in the past
    if (isPastTime(newScheduledFor)) {
      throw new Error('Cannot reschedule notification for past time');
    }

    // Update with Resend if emailId exists
    if (notificationRecord.notification.emailId) {
      try {
        await ResendEmailService.updateNotification(notificationRecord.notification.emailId, newScheduledFor);
      } catch (error) {
        throw new Error('Failed to update email schedule with Resend');
      }
    }

    // Update notification record
    await db
      .update(scheduledNotifications)
      .set({
        scheduledFor: newScheduledFor,
        daysBefore: newDaysBefore,
      })
      .where(eq(scheduledNotifications.id, notificationId));
  }

  /**
   * Get notifications for a subtask
   */
  static async getSubtaskNotifications(subtaskId: string): Promise<typeof scheduledNotifications.$inferSelect[]> {
    return await db
      .select()
      .from(scheduledNotifications)
      .where(
        and(
          eq(scheduledNotifications.entityId, subtaskId),
          eq(scheduledNotifications.type, 'subtask')
        )
      );
  }

  /**
   * Get notifications for an event
   */
  static async getEventNotifications(eventId: string): Promise<typeof scheduledNotifications.$inferSelect[]> {
    return await db
      .select()
      .from(scheduledNotifications)
      .where(
        and(
          eq(scheduledNotifications.entityId, eventId),
          eq(scheduledNotifications.type, 'event')
        )
      );
  }
} 