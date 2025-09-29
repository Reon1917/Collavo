import { db } from '@/db';
import { scheduledNotifications, subTasks, mainTasks, events, user, projects } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { ResendEmailService } from './resend-service';
import { generateSubtaskReminderTemplate } from './templates/subtask-reminder';
import { generateEventReminderTemplate } from './templates/event-reminder';
import { calculateScheduleTime, isPastTime, canScheduleNotification } from '@/utils/timezone';

const isDev = process.env.NODE_ENV === 'development';

const devLog = (...args: unknown[]) => {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.log(...args);
};

const devError = (...args: unknown[]) => {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.error(...args);
};

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
 * Sanitize email content to prevent injection
 */
function sanitizeEmailContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Notification service for managing email notifications
 */
export class NotificationService {
  /**
   * Create subtask notification
   */
  static async createSubtaskNotification(params: CreateSubtaskNotificationParams): Promise<string> {
    const { subtaskId, daysBefore, time, projectId, createdBy } = params;

    // Get subtask details with related data
    const subtaskData = await db
      .select({
        subtask: subTasks,
        mainTask: mainTasks,
        project: projects,
        assignedUser: user,
        assignedUserEmail: user.email,
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

    if (!subtaskRecord.assignedUserEmail) {
      throw new Error('Assigned user must have a valid email address');
    }

    // Check if deadline allows for notification scheduling
    if (!canScheduleNotification(subtaskRecord.subtask.deadline, daysBefore, time)) {
      devError('Subtask notification scheduling rejected', {
        projectId,
        subtaskId,
        daysBefore,
        time,
        deadline: subtaskRecord.subtask.deadline,
      });
      throw new Error('The notification time has already passed. Please choose a different time or fewer days before the deadline.');
    }

    // Calculate scheduled time
    const scheduledFor = calculateScheduleTime(subtaskRecord.subtask.deadline, daysBefore, time);

    // If the computed time is in the past, schedule for immediate delivery
    const finalScheduledTime = isPastTime(scheduledFor) ? new Date() : scheduledFor;

    // Generate email content with sanitization
    const emailHtml = generateSubtaskReminderTemplate({
      userName: sanitizeEmailContent(subtaskRecord.assignedUser.name),
      subtaskTitle: sanitizeEmailContent(subtaskRecord.subtask.title),
      deadline: subtaskRecord.subtask.deadline,
      projectName: sanitizeEmailContent(subtaskRecord.project.name),
      daysRemaining: daysBefore,
      projectId,
      subtaskId,
    });

    const subject = `Reminder: ${sanitizeEmailContent(subtaskRecord.subtask.title)} deadline in ${daysBefore} ${daysBefore === 1 ? 'day' : 'days'}`;

    // Send email with Resend
    const { emailId } = await ResendEmailService.sendEmail({
      to: [subtaskRecord.assignedUserEmail],
      subject,
      html: emailHtml,
      scheduledAt: finalScheduledTime,
    });

    // Subtask notification scheduled successfully

    // Save notification record
    const notificationId = createId();
    await db.insert(scheduledNotifications).values({
      id: notificationId,
      type: 'subtask',
      entityId: subtaskId,
      recipientUserId: subtaskRecord.assignedUser.id,
      scheduledFor: finalScheduledTime,
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

    // Check if event allows for notification scheduling
    
    if (!canScheduleNotification(eventRecord.event.datetime, daysBefore, time)) {
      const errorMsg = 'The notification time has already passed. Please choose a different time or fewer days before the event.';
      devError('Event notification scheduling rejected', {
        eventId,
        projectId,
        daysBefore,
        time,
        deadline: eventRecord.event.datetime,
      });
      throw new Error(errorMsg);
    }

    // Calculate scheduled time
    const scheduledFor = calculateScheduleTime(eventRecord.event.datetime, daysBefore, time);
    // Calculated scheduled time for event notification

    // If the computed time is in the past, schedule for immediate delivery
    const finalScheduledTime = isPastTime(scheduledFor) ? new Date() : scheduledFor;
    // Final scheduled time calculated

    // Get recipient user details
    const recipients = await db
      .select()
      .from(user)
      .where(inArray(user.id, recipientUserIds));

    if (recipients.length !== recipientUserIds.length) {
      throw new Error('Some recipient users not found');
    }

    const notificationIds: string[] = [];

    // Create individual notifications for each recipient in a transaction-like approach
    const createdNotifications: Array<{notificationId: string, emailId: string}> = [];
    
    try {
      
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i]!;
        
        // Generate email content with sanitization
        const templateParams: any = {
          userName: sanitizeEmailContent(recipient.name),
          eventTitle: sanitizeEmailContent(eventRecord.event.title),
          eventDate: eventRecord.event.datetime,
          projectName: sanitizeEmailContent(eventRecord.project.name),
          projectId,
          eventId,
          daysRemaining: daysBefore,
        };
        
        if (eventRecord.event.location) {
          templateParams.location = sanitizeEmailContent(eventRecord.event.location);
        }
        
        if (eventRecord.event.description) {
          templateParams.description = sanitizeEmailContent(eventRecord.event.description);
        }
        
        const emailHtml = generateEventReminderTemplate(templateParams);
        const subject = `Event Reminder: ${sanitizeEmailContent(eventRecord.event.title)} in ${daysBefore} ${daysBefore === 1 ? 'day' : 'days'}`;

        try {
          // Send email with Resend
          const { emailId } = await ResendEmailService.sendEmail({
            to: [recipient.email],
            subject,
            html: emailHtml,
            scheduledAt: finalScheduledTime,
          });

          // Save notification record
          const notificationId = createId();
          await db.insert(scheduledNotifications).values({
            id: notificationId,
            type: 'event',
            entityId: eventId,
            recipientUserId: recipient.id,
            scheduledFor: finalScheduledTime,
            daysBefore,
            status: 'pending',
            emailId,
            createdBy,
            projectId,
          });

          createdNotifications.push({ notificationId, emailId });
          notificationIds.push(notificationId);
        } catch (recipientError) {
          devError('Failed to create event notification for recipient', {
            eventId,
            projectId,
            recipientId: recipient.id,
            email: recipient.email,
            error: recipientError instanceof Error ? recipientError.message : recipientError,
          });
          throw new Error(`Failed to create notification for ${recipient.email}: ${recipientError instanceof Error ? recipientError.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      
      // Attempt to cleanup any partially created notifications
      if (createdNotifications.length > 0) {
        devLog('Cleaning up partially created event notifications', { count: createdNotifications.length, eventId, projectId });
        try {
          for (const { notificationId, emailId } of createdNotifications) {
            try {
              await ResendEmailService.cancelEmail(emailId);
              await db.delete(scheduledNotifications).where(eq(scheduledNotifications.id, notificationId));
            } catch (cleanupError) {
              devError('Failed to cleanup notification record', { notificationId, emailId, error: cleanupError instanceof Error ? cleanupError.message : cleanupError });
            }
          }
        } catch (cleanupError) {
          devError('Error during notification cleanup', cleanupError);
        }
      }
      
      throw error;
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
        await ResendEmailService.cancelEmail(notificationData.emailId);
      } catch {
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
        await ResendEmailService.updateEmail(notificationRecord.notification.emailId, newScheduledFor);
      } catch {
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