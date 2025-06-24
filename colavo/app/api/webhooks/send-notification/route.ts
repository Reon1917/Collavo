import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { 
  scheduledNotifications, 
  subTasks, 
  mainTasks, 
  projects, 
  user, 
  events,
  members 
} from '@/db/schema';
import { 
  sendTaskReminderEmail, 
  sendEventReminderEmail, 
  type EmailResult 
} from '@/lib/email-service';
import { formatThailandDate } from '@/lib/qstash-client';

/**
 * Webhook handler that QStash calls to send notifications
 */
async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { notificationId, type, entityId } = body;

    if (!notificationId || !type || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: notificationId, type, entityId' }, 
        { status: 400 }
      );
    }

    console.log(`Processing notification: ${notificationId} for ${type} ${entityId}`);

    // Get notification details
    const notification = await db
      .select()
      .from(scheduledNotifications)
      .where(eq(scheduledNotifications.id, notificationId))
      .limit(1);

    if (!notification[0]) {
      console.log(`Notification ${notificationId} not found`);
      return NextResponse.json({ message: 'Notification not found' }, { status: 200 });
    }

    const notif = notification[0];

    if (notif.status !== 'pending') {
      console.log(`Notification ${notificationId} already processed (status: ${notif.status})`);
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    let emailResult: EmailResult;

    // Send notification based on type
    if (type === 'subtask') {
      emailResult = await sendSubTaskReminder(notif);
    } else if (type === 'event') {
      emailResult = await sendEventReminder(notif);
    } else {
      throw new Error(`Unknown notification type: ${type}`);
    }

    // Update notification status
    const updateData: any = {
      sentAt: new Date(),
    };

    if (emailResult.success) {
      updateData.status = 'sent';
      updateData.emailId = emailResult.id;
    } else {
      updateData.status = 'failed';
    }

    await db
      .update(scheduledNotifications)
      .set(updateData)
      .where(eq(scheduledNotifications.id, notificationId));

    if (emailResult.success) {
      console.log(`Successfully sent notification ${notificationId}`);
      return NextResponse.json({ 
        message: 'Notification sent successfully',
        emailId: emailResult.id 
      }, { status: 200 });
    } else {
      console.error(`Failed to send notification ${notificationId}:`, emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: emailResult.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing notification webhook:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Send subtask reminder email
 */
async function sendSubTaskReminder(notification: any): Promise<EmailResult> {
  try {
    // Get subtask with user details
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
      .where(eq(subTasks.id, notification.entityId))
      .limit(1);

    if (!subtaskData[0]) {
      throw new Error('Subtask not found');
    }

    const { subtask, mainTask, project, assignedUser } = subtaskData[0];

    if (!assignedUser) {
      throw new Error('No assigned user for subtask');
    }

    // Check if task is completed (skip if completed)
    if (subtask.status === 'completed') {
      console.log(`Subtask ${notification.entityId} is completed, skipping notification`);
      return {
        id: 'skipped-completed',
        success: true,
      };
    }

    if (!subtask.deadline) {
      throw new Error('Subtask has no deadline');
    }

    // Send email
    const emailResult = await sendTaskReminderEmail(assignedUser.email, {
      assignedUserName: assignedUser.name,
      taskTitle: subtask.title,
      taskDescription: subtask.description || undefined,
      projectName: project.name,
      deadline: subtask.deadline,
      daysBefore: notification.daysBefore,
    });

    return emailResult;

  } catch (error) {
    console.error('Error sending subtask reminder:', error);
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send event reminder email
 */
async function sendEventReminder(notification: any): Promise<EmailResult> {
  try {
    // Get event details
    const eventData = await db
      .select({
        event: events,
        project: projects,
      })
      .from(events)
      .innerJoin(projects, eq(events.projectId, projects.id))
      .where(eq(events.id, notification.entityId))
      .limit(1);

    if (!eventData[0]) {
      throw new Error('Event not found');
    }

    const { event, project } = eventData[0];

    // Get recipient emails
    let recipientEmails: string[] = [];

    if (notification.recipientUserIds && notification.recipientUserIds.length > 0) {
      // Get specific recipients
      const recipients = await db
        .select({
          email: user.email,
          name: user.name,
        })
        .from(user)
        .where(
          // Need to use SQL IN operator for array of IDs
          // This is a simplified version - in production you'd use proper SQL IN
        );

      // For now, get each recipient individually (can be optimized later)
      for (const userId of notification.recipientUserIds) {
        const userResult = await db
          .select({
            email: user.email,
            name: user.name,
          })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        if (userResult[0]) {
          recipientEmails.push(userResult[0].email);
        }
      }
    } else {
      // No specific recipients specified, shouldn't happen but handle gracefully
      console.warn(`Event notification ${notification.id} has no recipients`);
      return {
        id: 'no-recipients',
        success: true,
      };
    }

    if (recipientEmails.length === 0) {
      return {
        id: 'no-valid-recipients',
        success: true,
      };
    }

    // Send email
    const emailResult = await sendEventReminderEmail(recipientEmails, {
      eventTitle: event.title,
      eventDescription: event.description || undefined,
      projectName: project.name,
      datetime: event.datetime,
      location: event.location || undefined,
      daysBefore: notification.daysBefore,
    });

    return emailResult;

  } catch (error) {
    console.error('Error sending event reminder:', error);
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export with QStash signature verification
export const POST = verifySignatureAppRouter(handler);

// For other methods, return 405
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 