import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelNotification, createSubtaskNotification } from '@/lib/actions/email-notifications';

interface NotificationData {
  id: string;
  createdAt: Date;
  projectId: string;
  createdBy: string;
  status: 'pending' | 'cancelled' | 'sent' | 'failed';
  type: 'subtask' | 'event';
  entityId: string;
  recipientUserId: string | null;
  recipientUserIds: string[] | null;
  scheduledFor: Date;
  daysBefore: number;
  qstashMessageId: string | null;
  emailId: string | null;
  sentAt: Date | null;
}

type EffectiveStatus = 'pending' | 'cancelled' | 'sent' | 'failed';

/**
 * Compute the effective status of a notification with optimistic update logic.
 * If the scheduled time has passed (with buffer), treat pending notifications as sent.
 */
function computeEffectiveStatus(notification: NotificationData): EffectiveStatus {
  // If already marked as cancelled, sent, or failed, return as-is
  if (notification.status === 'cancelled') return 'cancelled';
  if (notification.status === 'sent') return 'sent';
  if (notification.status === 'failed') return 'failed';

  // For pending notifications, check if scheduled time has passed
  const now = new Date();
  const scheduledTime = new Date(notification.scheduledFor);

  // Add 5-minute buffer to account for clock skew and processing time
  const bufferMs = 5 * 60 * 1000; // 5 minutes

  if (now.getTime() > scheduledTime.getTime() + bufferMs) {
    // Scheduled time has passed, optimistically mark as sent
    return 'sent';
  }

  // Still pending
  return 'pending';
}

interface NotificationsResponse {
  notifications: NotificationData[];
}

// Fetch notifications for a specific subtask
const fetchSubtaskNotifications = async (
  projectId: string,
  taskId: string,
  subtaskId: string
): Promise<NotificationData[]> => {
  const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/notifications`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  const data: NotificationsResponse = await response.json();
  return data.notifications || [];
};

export function useSubtaskNotifications(
  projectId: string,
  taskId: string,
  subtaskId: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['subtask-notifications', subtaskId],
    queryFn: () => fetchSubtaskNotifications(projectId, taskId, subtaskId),
    enabled: enabled && !!subtaskId && !!projectId && !!taskId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (replaced cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCancelNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ notificationId, projectId }: { notificationId: string; projectId: string }) => {
      const result = await cancelNotification(notificationId, projectId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel notification');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate all notification queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: ['subtask-notifications'],
        refetchType: 'active'
      });
    },
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      subtaskId: string;
      daysBefore: number;
      time: string;
      projectId: string;
    }) => {
      const result = await createSubtaskNotification(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create notification');
      }
      return result;
    },
    onSuccess: (_, { subtaskId }) => {
      // Invalidate the specific subtask's notifications
      queryClient.invalidateQueries({ 
        queryKey: ['subtask-notifications', subtaskId],
        refetchType: 'active'
      });
    },
  });
}

// Helper hook to get active notification status quickly with computed effective status
export function useHasActiveNotification(
  projectId: string,
  taskId: string,
  subtaskId: string,
  enabled = true
) {
  const { data: notifications, ...query } = useSubtaskNotifications(projectId, taskId, subtaskId, enabled);

  // Compute effective status for each notification
  const notificationsWithEffectiveStatus = notifications?.map(n => ({
    ...n,
    effectiveStatus: computeEffectiveStatus(n)
  }));

  // Only consider notifications with pending effective status as "active"
  const hasActiveNotification = notificationsWithEffectiveStatus?.some(n => n.effectiveStatus === 'pending') || false;
  const activeNotification = notificationsWithEffectiveStatus?.find(n => n.effectiveStatus === 'pending');

  // Also return the most recent notification regardless of status (for showing sent/cancelled state)
  const latestNotification = notificationsWithEffectiveStatus?.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  return {
    hasActiveNotification,
    activeNotification,
    latestNotification, // includes effectiveStatus
    notifications: notificationsWithEffectiveStatus,
    ...query
  };
} 