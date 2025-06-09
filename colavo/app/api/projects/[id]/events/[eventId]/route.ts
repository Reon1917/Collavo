import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { requireProjectAccess } from '@/lib/auth-helpers';

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
    
    // Ensure user has access to this project
    const access = await requireProjectAccess(session.user.id, projectId);

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

    // Check permissions: only the creator or project leader can delete events
    const canDelete = event.createdBy === session.user.id || access.isLeader;

    if (!canDelete) {
      return NextResponse.json({ error: 'You do not have permission to delete this event' }, { status: 403 });
    }

    // Delete the event
    await db.delete(events).where(eq(events.id, eventId));

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 