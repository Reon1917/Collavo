import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  scheduleSubTaskNotification, 
  scheduleEventNotification,
  type ScheduleSubTaskNotificationParams,
  type ScheduleEventNotificationParams
} from '@/lib/notification-scheduler';

/**
 * Schedule a notification
 * POST /api/notifications/schedule
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, subTaskId, eventId, daysBefore, recipientUserIds } = body;

    if (!type || !daysBefore) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, daysBefore' 
      }, { status: 400 });
    }

    if (!['subtask', 'event'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be "subtask" or "event"' 
      }, { status: 400 });
    }

    if (daysBefore < 1 || daysBefore > 30) {
      return NextResponse.json({ 
        error: 'daysBefore must be between 1 and 30' 
      }, { status: 400 });
    }

    const createdBy = session.user.id;

    if (type === 'subtask') {
      if (!subTaskId) {
        return NextResponse.json({ 
          error: 'subTaskId is required for subtask notifications' 
        }, { status: 400 });
      }

      const params: ScheduleSubTaskNotificationParams = {
        subTaskId,
        daysBefore,
        createdBy
      };

      try {
        const result = await scheduleSubTaskNotification(params);
        
        return NextResponse.json({
          success: true,
          message: 'Subtask notification scheduled successfully',
          notificationId: result.notificationId,
          qstashMessageId: result.qstashMessageId
        });

      } catch (error) {
        console.error('Failed to schedule subtask notification:', error);
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to schedule notification'
        }, { status: 500 });
      }
    }

    if (type === 'event') {
      if (!eventId) {
        return NextResponse.json({ 
          error: 'eventId is required for event notifications' 
        }, { status: 400 });
      }

      if (!recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
        return NextResponse.json({ 
          error: 'recipientUserIds array is required for event notifications' 
        }, { status: 400 });
      }

      const params: ScheduleEventNotificationParams = {
        eventId,
        daysBefore,
        recipientUserIds,
        createdBy
      };

      try {
        const result = await scheduleEventNotification(params);
        
        return NextResponse.json({
          success: true,
          message: 'Event notification scheduled successfully',
          notificationId: result.notificationId,
          qstashMessageId: result.qstashMessageId
        });

      } catch (error) {
        console.error('Failed to schedule event notification:', error);
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to schedule notification'
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error in schedule notification endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Get schedule endpoint info
 * GET /api/notifications/schedule
 */
export async function GET() {
  return NextResponse.json({
    message: 'Notification scheduling endpoint',
    usage: {
      subtask: {
        method: 'POST',
        body: {
          type: 'subtask',
          subTaskId: 'string',
          daysBefore: 'number (1-30)'
        }
      },
      event: {
        method: 'POST',
        body: {
          type: 'event',
          eventId: 'string',
          daysBefore: 'number (1-30)',
          recipientUserIds: 'string[]'
        }
      }
    },
    environment: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasQStashToken: !!process.env.QSTASH_TOKEN,
      hasQStashSigningKeys: !!(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    }
  });
} 