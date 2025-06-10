import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, user } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { requireProjectAccess } from '@/lib/auth-helpers';

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
    
    // Ensure user has access to this project
    await requireProjectAccess(session.user.id, projectId);

    const body = await request.json();
    const { title, description, datetime, location } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }

    if (!datetime) {
      return NextResponse.json({ error: 'Event date and time is required' }, { status: 400 });
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

    // Get the created event with creator information
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

    return NextResponse.json(eventWithCreatorResult[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 