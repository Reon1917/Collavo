import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { scheduledNotifications, projects, members, subTasks, events, mainTasks, user } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Get a specific notification by ID
 * GET /api/notifications/[id]
 */
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

    const { id: notificationId } = await params;

    // Get the notification
    const notificationResult = await db
      .select({
        id: scheduledNotifications.id,
        type: scheduledNotifications.type,
        entityId: scheduledNotifications.entityId,
        recipientUserId: scheduledNotifications.recipientUserId,
        recipientUserIds: scheduledNotifications.recipientUserIds,
        scheduledFor: scheduledNotifications.scheduledFor,
        daysBefore: scheduledNotifications.daysBefore,
        status: scheduledNotifications.status,
        qstashMessageId: scheduledNotifications.qstashMessageId,
        emailId: scheduledNotifications.emailId,
        sentAt: scheduledNotifications.sentAt,
        createdBy: scheduledNotifications.createdBy,
        projectId: scheduledNotifications.projectId,
        createdAt: scheduledNotifications.createdAt,
        // Project info
        projectName: projects.name,
        // Creator info
        creatorName: user.name,
        creatorEmail: user.email,
      })
      .from(scheduledNotifications)
      .leftJoin(projects, eq(scheduledNotifications.projectId, projects.id))
      .leftJoin(user, eq(scheduledNotifications.createdBy, user.id))
      .where(eq(scheduledNotifications.id, notificationId))
      .limit(1);

    if (notificationResult.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const notification = notificationResult[0]!;

    // Check if user has access to this notification (must be member of the project)
    const userAccess = await db
      .select()
      .from(members)
      .where(and(
        eq(members.userId, session.user.id),
        eq(members.projectId, notification.projectId)
      ))
      .limit(1);

    if (userAccess.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get entity details
    let entityDetails = null;
    let recipientDetails = null;

    if (notification.type === 'subtask') {
      const subtaskDetails = await db
        .select({
          title: subTasks.title,
          description: subTasks.description,
          deadline: subTasks.deadline,
          status: subTasks.status,
          assignedUserId: subTasks.assignedId,
          assignedUserName: user.name,
          assignedUserEmail: user.email,
          mainTaskTitle: mainTasks.title,
        })
        .from(subTasks)
        .leftJoin(user, eq(subTasks.assignedId, user.id))
        .leftJoin(mainTasks, eq(subTasks.mainTaskId, mainTasks.id))
        .where(eq(subTasks.id, notification.entityId))
        .limit(1);

      if (subtaskDetails.length > 0) {
        entityDetails = {
          type: 'subtask',
          ...subtaskDetails[0]
        };
      }

      // For subtasks, get recipient details
      if (notification.recipientUserId) {
        const recipientResult = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(eq(user.id, notification.recipientUserId))
          .limit(1);

        if (recipientResult.length > 0) {
          recipientDetails = [recipientResult[0]];
        }
      }
    } else if (notification.type === 'event') {
      const eventDetails = await db
        .select({
          title: events.title,
          description: events.description,
          datetime: events.datetime,
          location: events.location,
        })
        .from(events)
        .where(eq(events.id, notification.entityId))
        .limit(1);

      if (eventDetails.length > 0) {
        entityDetails = {
          type: 'event',
          ...eventDetails[0]
        };
      }

      // For events, get all recipient details
      if (notification.recipientUserIds && notification.recipientUserIds.length > 0) {
        const recipientResults = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(inArray(user.id, notification.recipientUserIds));

        recipientDetails = recipientResults;
      }
    }

    return NextResponse.json({
      ...notification,
      entityDetails,
      recipientDetails
    });

  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }} 