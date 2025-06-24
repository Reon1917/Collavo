import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireProjectAccess } from '@/lib/auth-helpers';
import { scheduleEventNotification } from '@/lib/notification-scheduler';
import { db } from '@/lib/db';
import { events, projectMembers } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const eventId = params.eventId;

    // Check project access
    const projectAccess = await requireProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { notificationSettings } = body;

    if (!notificationSettings?.enabled) {
      return NextResponse.json({ error: 'Notification settings must be enabled' }, { status: 400 });
    }

    // Validate notification settings
    if (typeof notificationSettings.daysBefore !== 'number' || 
        notificationSettings.daysBefore < 1 || 
        notificationSettings.daysBefore > 30) {
      return NextResponse.json({ 
        error: 'daysBefore must be between 1 and 30 when notifications are enabled' 
      }, { status: 400 });
    }

    if (!notificationSettings.recipientUserIds || notificationSettings.recipientUserIds.length === 0) {
      return NextResponse.json({ 
        error: 'At least one recipient is required when notifications are enabled' 
      }, { status: 400 });
    }

    // Find the event
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.projectId, projectId)))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify all recipients are project members
    const members = await db
      .select()
      .from(projectMembers)
      .where(and(
        eq(projectMembers.projectId, projectId),
        inArray(projectMembers.userId, notificationSettings.recipientUserIds)
      ));

    const memberIds = members.map(m => m.userId);
    const invalidRecipients = notificationSettings.recipientUserIds.filter(
      (id: string) => !memberIds.includes(id)
    );

    if (invalidRecipients.length > 0) {
      return NextResponse.json({ 
        error: 'All notification recipients must be project members' 
      }, { status: 400 });
    }

    // Schedule the event notification
    try {
      const notificationId = await scheduleEventNotification(
        eventId,
        notificationSettings.daysBefore,
        notificationSettings.recipientUserIds
      );

      return NextResponse.json({
        success: true,
        message: 'Event notification scheduled successfully',
        notificationId,
        eventTitle: event.title,
        recipientCount: notificationSettings.recipientUserIds.length,
        daysBefore: notificationSettings.daysBefore
      });

    } catch (error) {
      console.error(`Failed to schedule notification for event ${eventId}:`, error);
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Failed to schedule event notification'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error setting up event notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 