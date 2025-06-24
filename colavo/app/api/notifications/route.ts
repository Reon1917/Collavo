import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { scheduledNotifications, projects, members, subTasks, events, mainTasks, user } from '@/db/schema';
import { eq, and, desc, or } from 'drizzle-orm';

/**
 * Get notifications for user's projects
 * GET /api/notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate query parameters
    if (limit > 100) {
      return NextResponse.json({ 
        error: 'Limit cannot exceed 100' 
      }, { status: 400 });
    }

    if (status && !['pending', 'sent', 'failed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be: pending, sent, failed, or cancelled' 
      }, { status: 400 });
    }

    if (type && !['subtask', 'event'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be: subtask or event' 
      }, { status: 400 });
    }

    // Get user's projects
    const userProjects = await db
      .select({ projectId: members.projectId })
      .from(members)
      .where(eq(members.userId, session.user.id));

    const projectIds = userProjects.map(p => p.projectId);

    if (projectIds.length === 0) {
      return NextResponse.json({ 
        notifications: [], 
        total: 0,
        hasMore: false 
      });
    }

    // Build the base query
    let whereConditions = [
      or(...projectIds.map(id => eq(scheduledNotifications.projectId, id)))
    ];

    // Add filters
    if (projectId && projectIds.includes(projectId)) {
      whereConditions = [eq(scheduledNotifications.projectId, projectId)];
    }

    if (status) {
      whereConditions.push(eq(scheduledNotifications.status, status as any));
    }

    if (type) {
      whereConditions.push(eq(scheduledNotifications.type, type as any));
    }

    // Get notifications with related data
    const notifications = await db
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
      .where(and(...whereConditions))
      .orderBy(desc(scheduledNotifications.createdAt))
      .limit(limit + 1) // Get one extra to check if there are more
      .offset(offset);

    const hasMore = notifications.length > limit;
    const resultNotifications = hasMore ? notifications.slice(0, limit) : notifications;

    // Get entity details (subtask or event info)
    const enhancedNotifications = await Promise.all(
      resultNotifications.map(async (notification) => {
        let entityDetails = null;

        if (notification.type === 'subtask') {
          const subtaskDetails = await db
            .select({
              title: subTasks.title,
              deadline: subTasks.deadline,
              status: subTasks.status,
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
        }

        return {
          ...notification,
          entityDetails
        };
      })
    );

    // Get total count for pagination
    const totalResult = await db
      .select({ count: scheduledNotifications.id })
      .from(scheduledNotifications)
      .where(and(...whereConditions));

    return NextResponse.json({
      notifications: enhancedNotifications,
      total: totalResult.length,
      hasMore,
      pagination: {
        limit,
        offset,
        nextOffset: hasMore ? offset + limit : null
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
} 