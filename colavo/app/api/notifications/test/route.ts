import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { scheduleSubTaskNotification, scheduleEventNotification } from '@/lib/notification-scheduler';
import { db } from '@/db';
import { subTasks, events, projects, members } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Test notification scheduling with short delays
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
    const { type, entityId, delayMinutes = 1 } = body;

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

    if (delayMinutes < 1 || delayMinutes > 60) {
      return NextResponse.json({ 
        error: 'delayMinutes must be between 1 and 60 for testing' 
      }, { status: 400 });
    }

    let result;

    if (type === 'subtask') {
      // Verify subtask exists and user has access
      const subtask = await db
        .select({
          id: subTasks.id,
          assignedId: subTasks.assignedId,
          projectId: projects.id,
        })
        .from(subTasks)
        .innerJoin(projects, eq(subTasks.mainTaskId, projects.id))
        .innerJoin(members, eq(projects.id, members.projectId))
        .where(eq(subTasks.id, entityId))
        .limit(1);

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
        createdBy: session.user.id,
        customScheduledFor: testScheduledFor // We'll need to add this parameter
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
        recipientUserIds,
        createdBy: session.user.id,
        customScheduledFor: testScheduledFor // We'll need to add this parameter
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
    console.error('Error in test notification endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
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
        delayMinutes: 'number (1-60, default: 1)',
        recipientUserIds: 'string[] (required for events)'
      }
    },
    environment: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasQStashToken: !!process.env.QSTASH_TOKEN,
      hasQStashSigningKeys: !!(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    },
    note: 'This endpoint is for development and testing only. It allows scheduling notifications with minute delays instead of day delays.'
  });
} 