import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelNotification, createSubtaskNotification } from '@/lib/actions/email-notifications';

interface NotificationData {
  id: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  daysBefore: number;
  scheduledFor: string;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationData[];
}

// Fetch notifications for a specific subtask
const fetchSubtaskNotifications = async (
  projectId: string, 
  subtaskId: string
): Promise<NotificationData[]> => {
  const response = await fetch(`/api/projects/${projectId}/tasks/0/subtasks/${subtaskId}/notifications`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  const data: NotificationsResponse = await response.json();
  return data.notifications || [];
};

export function useSubtaskNotifications(projectId: string, subtaskId: string, enabled = true) {
  return useQuery({
    queryKey: ['subtask-notifications', subtaskId],
    queryFn: () => fetchSubtaskNotifications(projectId, subtaskId),
    enabled: enabled && !!subtaskId && !!projectId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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

// Helper hook to get active notification status quickly
export function useHasActiveNotification(projectId: string, subtaskId: string, enabled = true) {
  const { data: notifications, ...query } = useSubtaskNotifications(projectId, subtaskId, enabled);
  
  const hasActiveNotification = notifications?.some(n => n.status === 'pending') || false;
  const activeNotification = notifications?.find(n => n.status === 'pending');
  
  return {
    hasActiveNotification,
    activeNotification,
    notifications,
    ...query
  };
} 