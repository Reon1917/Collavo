'use server';

import { auth } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/auth-helpers';
import { NotificationService } from '@/lib/email/notification-service';
import { revalidatePath } from 'next/cache';

export interface CreateSubtaskNotificationData {
  subtaskId: string;
  daysBefore: number;
  time: string;
  projectId: string;
}

export interface CreateEventNotificationData {
  eventId: string;
  recipientUserIds: string[];
  daysBefore: number;
  time: string;
  projectId: string;
}

export interface UpdateNotificationData {
  notificationId: string;
  daysBefore?: number;
  time?: string;
}

/**
 * Create subtask notification
 */
export async function createSubtaskNotification(data: CreateSubtaskNotificationData) {
  try {
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(mod => mod.headers()),
    });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const { subtaskId, daysBefore, time, projectId } = data;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      throw new Error('Access denied to project');
    }

    // Validate input
    if (daysBefore < 1 || daysBefore > 30) {
      throw new Error('Days before must be between 1 and 30');
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }

    // Create notification
    const notificationId = await NotificationService.createSubtaskNotification({
      subtaskId,
      userId: session.user.id,
      daysBefore,
      time,
      projectId,
      createdBy: session.user.id,
    });

    revalidatePath(`/project/${projectId}`);

    return {
      success: true,
      notificationId,
      message: 'Notification scheduled successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification',
    };
  }
}

/**
 * Create event notification
 */
export async function createEventNotification(data: CreateEventNotificationData) {
  try {
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(mod => mod.headers()),
    });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const { eventId, recipientUserIds, daysBefore, time, projectId } = data;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      throw new Error('Access denied to project');
    }

    // Validate input
    if (daysBefore < 0 || daysBefore > 30) {
      throw new Error('Days before must be between 0 and 30');
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }

    if (!recipientUserIds.length) {
      throw new Error('At least one recipient must be selected');
    }

    // Create notifications
    const notificationIds = await NotificationService.createEventNotification({
      eventId,
      recipientUserIds,
      daysBefore,
      time,
      projectId,
      createdBy: session.user.id,
    });

    revalidatePath(`/project/${projectId}`);

    return {
      success: true,
      notificationIds,
      message: `${notificationIds.length} notification(s) scheduled successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notifications',
    };
  }
}

/**
 * Cancel notification
 */
export async function cancelNotification(notificationId: string, projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(mod => mod.headers()),
    });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      throw new Error('Access denied to project');
    }

    await NotificationService.cancelNotification(notificationId);

    revalidatePath(`/project/${projectId}`);

    return {
      success: true,
      message: 'Notification cancelled successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel notification',
    };
  }
}

/**
 * Update notification
 */
export async function updateNotification(data: UpdateNotificationData, projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(mod => mod.headers()),
    });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const { notificationId, daysBefore, time } = data;

    // Check project access
    const access = await checkProjectAccess(projectId, session.user.id);
    if (!access.hasAccess) {
      throw new Error('Access denied to project');
    }

    // Validate input
    if (daysBefore !== undefined && (daysBefore < 0 || daysBefore > 30)) {
      throw new Error('Days before must be between 0 and 30');
    }

    if (time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }

    const updateParams: any = {};
    if (daysBefore !== undefined) {
      updateParams.daysBefore = daysBefore;
    }
    if (time !== undefined) {
      updateParams.time = time;
    }

    await NotificationService.updateNotification(notificationId, updateParams);

    revalidatePath(`/project/${projectId}`);

    return {
      success: true,
      message: 'Notification updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notification',
    };
  }
} 