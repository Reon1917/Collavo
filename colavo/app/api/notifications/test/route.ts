import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { scheduleSubTaskNotification, scheduleEventNotification } from '@/lib/notification-scheduler';
import { sendNotificationEmail } from '@/lib/email-service';
import { db } from '@/db';
import { subTasks, mainTasks, events, projects, members, user } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Test notification scheduling with short delays OR immediate email sending
 * POST /api/notifications/test
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, entityId, delayMinutes = 1, sendImmediately = false } = body;

    if (!type || !entityId) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, entityId' 
      }, { status: 400 });
    }

    if (!['subtask', 'event'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be "subtask" or "event"' 
      }, { status: 400 });
    }

    if (!sendImmediately && (delayMinutes < 1 || delayMinutes > 60)) {
      return NextResponse.json({ 
        error: 'delayMinutes must be between 1 and 60 for testing' 
      }, { status: 400 });
    }

    // If sendImmediately is true, send email directly instead of scheduling
    if (sendImmediately) {
      return await handleImmediateEmailTest(type, entityId, body, session.user.id);
    }

    let result;

    if (type === 'subtask') {
      // Verify subtask exists and user has access
      const subtaskQuery = db
        .select({
          id: subTasks.id,
          assignedId: subTasks.assignedId,
          projectId: projects.id,
        })
        .from(subTasks)
        .innerJoin(mainTasks, eq(subTasks.mainTaskId, mainTasks.id))
        .innerJoin(projects, eq(mainTasks.projectId, projects.id))
        .innerJoin(members, eq(projects.id, members.projectId))
        .where(and(
          eq(subTasks.id, entityId),
          eq(members.userId, session.user.id)
        ))
        .limit(1);
      
      const subtask = await subtaskQuery;

      if (!subtask.length) {
        return NextResponse.json({ 
          error: 'Subtask not found or access denied' 
        }, { status: 404 });
      }

      if (!subtask[0]?.assignedId) {
        return NextResponse.json({ 
          error: 'Subtask must have an assigned user for notifications' 
        }, { status: 400 });
      }

      // Create a test notification with custom delay (in minutes instead of days)
      const testScheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);
      
      result = await scheduleSubTaskNotification({
        subTaskId: entityId,
        daysBefore: 1, // This will be overridden by our custom date
        notificationTime: "09:00", // Default for testing
        createdBy: session.user.id,
        customScheduledFor: testScheduledFor
      });

    } else if (type === 'event') {
      const { recipientUserIds } = body;

      if (!recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
        return NextResponse.json({ 
          error: 'recipientUserIds array is required for event notifications' 
        }, { status: 400 });
      }

      // Verify event exists and user has access
      const event = await db
        .select({
          id: events.id,
          projectId: events.projectId,
        })
        .from(events)
        .innerJoin(members, eq(events.projectId, members.projectId))
        .where(eq(events.id, entityId))
        .limit(1);

      if (!event.length) {
        return NextResponse.json({ 
          error: 'Event not found or access denied' 
        }, { status: 404 });
      }

      // Verify recipients are project members
      const projectMembers = await db
        .select({ userId: members.userId })
        .from(members)
        .where(eq(members.projectId, event[0]!.projectId));

      const memberIds = projectMembers.map(m => m.userId);
      const invalidRecipients = recipientUserIds.filter((id: string) => !memberIds.includes(id));

      if (invalidRecipients.length > 0) {
        return NextResponse.json({ 
          error: 'All recipients must be project members' 
        }, { status: 400 });
      }

      // Create a test notification with custom delay
      const testScheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);
      
      result = await scheduleEventNotification({
        eventId: entityId,
        daysBefore: 1, // This will be overridden by our custom date
        notificationTime: "09:00", // Default for testing
        recipientUserIds,
        createdBy: session.user.id,
        customScheduledFor: testScheduledFor
      });
    }

    return NextResponse.json({
      success: true,
      message: `Test notification scheduled successfully for ${delayMinutes} minute(s)`,
      notificationId: result?.notificationId,
      qstashMessageId: result?.qstashMessageId,
      scheduledFor: new Date(Date.now() + delayMinutes * 60 * 1000).toISOString(),
      type,
      entityId,
      delayMinutes
    });

  } catch (error) {
    // Error in test notification endpoint
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Handle immediate email testing (bypasses QStash)
 */
async function handleImmediateEmailTest(
  type: string,
  entityId: string,
  body: any,
  userId: string
) {
  try {
    if (type === 'subtask') {
      // Get subtask details with project and assigned user
      const subtaskData = await db
        .select({
          subtask: subTasks,
          project: projects,
          assignedUser: user,
          mainTask: mainTasks
        })
        .from(subTasks)
        .innerJoin(mainTasks, eq(subTasks.mainTaskId, mainTasks.id))
        .innerJoin(projects, eq(mainTasks.projectId, projects.id))
        .innerJoin(user, eq(subTasks.assignedId, user.id))
        .innerJoin(members, eq(projects.id, members.projectId))
        .where(and(
          eq(subTasks.id, entityId),
          eq(members.userId, userId)
        ))
        .limit(1);

      if (!subtaskData.length) {
        return NextResponse.json({ 
          error: 'Subtask not found or access denied' 
        }, { status: 404 });
      }

      const { subtask, project, assignedUser, mainTask } = subtaskData[0]!;

      // Send email directly
      await sendNotificationEmail({
        type: 'subtask_reminder',
        recipientEmail: assignedUser.email,
        recipientName: assignedUser.name || assignedUser.email,
        data: {
          subtaskTitle: subtask.title,
          mainTaskTitle: mainTask.title,
          projectName: project.name,
                     deadline: subtask.deadline!,
          projectId: project.id,
          subtaskId: subtask.id
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Test email sent immediately',
        type: 'subtask',
        recipient: assignedUser.email,
        sentAt: new Date().toISOString()
      });

    } else if (type === 'event') {
      const { recipientUserIds } = body;

      if (!recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
        return NextResponse.json({ 
          error: 'recipientUserIds array is required for event notifications' 
        }, { status: 400 });
      }

      // Get event details with project
      const eventData = await db
        .select({
          event: events,
          project: projects
        })
        .from(events)
        .innerJoin(projects, eq(events.projectId, projects.id))
        .innerJoin(members, eq(projects.id, members.projectId))
        .where(and(
          eq(events.id, entityId),
          eq(members.userId, userId)
        ))
        .limit(1);

      if (!eventData.length) {
        return NextResponse.json({ 
          error: 'Event not found or access denied' 
        }, { status: 404 });
      }

      // Get recipient users
      const recipients = await db
        .select({
          id: user.id,
          email: user.email,
          name: user.name
        })
        .from(user)
        .where(inArray(user.id, recipientUserIds));

      if (recipients.length !== recipientUserIds.length) {
        return NextResponse.json({ 
          error: 'Some recipient users not found' 
        }, { status: 404 });
      }

      const { event, project } = eventData[0]!;

      // Send emails to all recipients
      const emailPromises = recipients.map(recipient => 
        sendNotificationEmail({
          type: 'event_reminder',
          recipientEmail: recipient.email,
          recipientName: recipient.name || recipient.email,
                     data: {
             eventTitle: event.title,
             projectName: project.name,
             eventDatetime: event.datetime,
             ...(event.description && { eventDescription: event.description }),
             projectId: project.id,
             eventId: event.id
           }
        })
      );

      await Promise.all(emailPromises);

      return NextResponse.json({
        success: true,
        message: `Test emails sent immediately to ${recipients.length} recipient(s)`,
        type: 'event',
        recipients: recipients.map(r => r.email),
        sentAt: new Date().toISOString()
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send immediate test email'
    }, { status: 500 });
  }
  
  // Fallback return (should never reach here)
  return NextResponse.json({
    success: false,
    error: 'Unsupported notification type'
  }, { status: 400 });
}

/**
 * Get test endpoint info and current environment status
 * GET /api/notifications/test
 */
export async function GET() {
  return NextResponse.json({
    message: 'Notification testing endpoint',
    usage: {
      method: 'POST',
      body: {
        type: 'subtask | event',
        entityId: 'string (subtask ID or event ID)',
        delayMinutes: 'number (1-60, default: 1) - ignored if sendImmediately is true',
        sendImmediately: 'boolean (default: false) - bypasses QStash and sends email directly',
        recipientUserIds: 'string[] (required for events)'
      }
    },
    environment: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasQStashToken: !!process.env.QSTASH_TOKEN,
      hasQStashSigningKeys: !!(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    },
    note: 'This endpoint is for development and testing only. Use sendImmediately=true to test actual email delivery in development.'
  });
}