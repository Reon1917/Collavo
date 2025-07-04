import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventNotifications, cancelNotification } from '@/lib/actions/email-notifications';

interface EventNotificationData {
  id: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  daysBefore: number;
  scheduledFor: string;
  recipientUserId: string;
  createdAt: string;
}

/**
 * Hook to fetch event notifications
 */
export function useEventNotifications(projectId: string, eventId: string, enabled = true) {
  return useQuery({
    queryKey: ['event-notifications', projectId, eventId],
    queryFn: async (): Promise<EventNotificationData[]> => {
      const result = await getEventNotifications(eventId, projectId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch event notifications');
      }
      return result.notifications as EventNotificationData[];
    },
    enabled: enabled && !!projectId && !!eventId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to cancel event notification
 */
export function useCancelEventNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ notificationId, projectId }: { notificationId: string; projectId: string }) => {
      const result = await cancelNotification(notificationId, projectId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel notification');
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate event notification queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: ['event-notifications', variables.projectId],
        refetchType: 'active'
      });
    },
  });
}

/**
 * Helper hook to get active notification status quickly
 */
export function useHasActiveEventNotification(projectId: string, eventId: string, enabled = true) {
  const { data: notifications, ...query } = useEventNotifications(projectId, eventId, enabled);
  
  const activeNotifications = notifications?.filter(n => n.status === 'pending') || [];
  const hasActiveNotification = activeNotifications.length > 0;
  
  return {
    hasActiveNotification,
    activeNotifications,
    notificationCount: activeNotifications.length,
    notifications,
    ...query
  };
} 