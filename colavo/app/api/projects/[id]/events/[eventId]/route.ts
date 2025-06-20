import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { checkPermissionDetailed, createPermissionErrorResponse } from '@/lib/auth-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, eventId } = await params;

    // Get the event to check ownership and project association
    const [event] = await db
      .select({
        id: events.id,
        createdBy: events.createdBy,
        projectId: events.projectId,
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.projectId !== projectId) {
      return NextResponse.json({ error: 'Event does not belong to this project' }, { status: 400 });
    }

    // Check if user has handleEvent permission for updating events
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'handleEvent');
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.errorType === 'INVALID_PROJECT' ? 404 : 403;
      return NextResponse.json(
        createPermissionErrorResponse(permissionCheck),
        { status: statusCode }
      );
    }

    const body = await request.json();
    const { title, description, datetime, location } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }

    if (!datetime) {
      return NextResponse.json({ error: 'Event date and time is required' }, { status: 400 });
    }

    // Update the event
    await db
      .update(events)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        datetime: new Date(datetime),
        location: location?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));

    // Get the updated event with creator information
    const [updatedEvent] = await db
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
      .where(eq(events.id, eventId))
      .limit(1);

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Failed to retrieve updated event' }, { status: 500 });
    }

        return NextResponse.json(updatedEvent);
  } catch {
 
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, eventId } = await params;

    // Get the event to check ownership and project association
    const [event] = await db
      .select({
        id: events.id,
        createdBy: events.createdBy,
        projectId: events.projectId,
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.projectId !== projectId) {
      return NextResponse.json({ error: 'Event does not belong to this project' }, { status: 400 });
    }

    // Check if user has handleEvent permission for deleting events
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'handleEvent');
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.errorType === 'INVALID_PROJECT' ? 404 : 403;
      return NextResponse.json(
        createPermissionErrorResponse(permissionCheck),
        { status: statusCode }
      );
    }

    // Delete the event
    await db.delete(events).where(eq(events.id, eventId));

        return NextResponse.json({ message: 'Event deleted successfully' });
  } catch {
 
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 