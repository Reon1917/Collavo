import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, user, members } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { requireProjectAccess, checkPermissionDetailed, createPermissionErrorResponse } from '@/lib/auth-helpers';
import { scheduleEventNotification } from '@/lib/notification-scheduler';

export async function GET(
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

    const { id: projectId } = await params;
    
    // Ensure user has access to this project
    await requireProjectAccess(session.user.id, projectId);

    // Fetch events with creator information
    const projectEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        datetime: events.datetime,
        location: events.location,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        creatorName: user.name,
        creatorEmail: user.email,
      })
      .from(events)
      .leftJoin(user, eq(events.createdBy, user.id))
      .where(eq(events.projectId, projectId))
      .orderBy(desc(events.datetime));

    return NextResponse.json({ events: projectEvents });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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

    const { id: projectId } = await params;
    
    // Check if user has createEvent permission
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'createEvent');
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.errorType === 'INVALID_PROJECT' ? 404 : 403;
      return NextResponse.json(
        createPermissionErrorResponse(permissionCheck),
        { status: statusCode }
      );
    }

    const body = await request.json();
    const { title, description, datetime, location, notificationSettings } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }

    if (!datetime) {
      return NextResponse.json({ error: 'Event date and time is required' }, { status: 400 });
    }

    // Validate notification settings if provided
    if (notificationSettings) {
      const { daysBefore, recipientUserIds } = notificationSettings;
      if (!daysBefore || daysBefore < 1 || daysBefore > 30) {
        return NextResponse.json({ 
          error: 'daysBefore must be between 1 and 30' 
        }, { status: 400 });
      }
      if (!recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
        return NextResponse.json({ 
          error: 'At least one recipient is required for notifications' 
        }, { status: 400 });
      }
      
      // Validate that all recipient users are members of the project
      const projectMembers = await db
        .select({ userId: members.userId })
        .from(members)
        .where(eq(members.projectId, projectId));
      
      const memberIds = projectMembers.map(m => m.userId);
      const invalidRecipients = recipientUserIds.filter(id => !memberIds.includes(id));
      
      if (invalidRecipients.length > 0) {
        return NextResponse.json({ 
          error: 'All notification recipients must be project members' 
        }, { status: 400 });
      }
    }

    // Create the event
    const newEventResult = await db
      .insert(events)
      .values({
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        datetime: new Date(datetime),
        location: location?.trim() || null,
        createdBy: session.user.id,
      })
      .returning();

    if (newEventResult.length === 0) {
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    const newEvent = newEventResult[0]!;

    // Schedule notification if provided and all requirements are met
    let notificationResult = null;
    if (notificationSettings && notificationSettings.recipientUserIds?.length > 0) {
      try {
        notificationResult = await scheduleEventNotification({
          eventId: newEvent.id,
          daysBefore: notificationSettings.daysBefore,
          notificationTime: notificationSettings.notificationTime,
          recipientUserIds: notificationSettings.recipientUserIds,
          createdBy: session.user.id
        });
      } catch (error) {
        // Don't fail the whole request if notification scheduling fails
        // The event was created successfully
        console.error('Failed to schedule notification for new event:', {
          eventId: newEvent.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Fetch the created event with creator information
    const eventWithCreatorResult = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        datetime: events.datetime,
        location: events.location,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        creatorName: user.name,
        creatorEmail: user.email,
      })
      .from(events)
      .leftJoin(user, eq(events.createdBy, user.id))
      .where(eq(events.id, newEvent.id));

    if (eventWithCreatorResult.length === 0) {
      return NextResponse.json({ error: 'Failed to retrieve created event' }, { status: 500 });
    }

    const response = {
      ...eventWithCreatorResult[0],
      notification: notificationResult ? {
        scheduled: true,
        notificationId: notificationResult.notificationId,
        daysBefore: notificationSettings.daysBefore,
        recipientCount: notificationSettings.recipientUserIds.length
      } : null
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 