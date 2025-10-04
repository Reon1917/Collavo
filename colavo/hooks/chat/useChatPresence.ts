import { useRef, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPresence } from '@/types';
import { useUserActivity } from '../useUserActivity';

interface UseChatPresenceOptions {
  projectId: string;
  currentUserId: string;
  enabled?: boolean;
}

interface UseChatPresenceReturn {
  updatePresence: (isOnline: boolean) => void;
  lastPresenceUpdateRef: React.MutableRefObject<Date | null>;
  presenceIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function useChatPresence({ 
  projectId, 
  currentUserId, 
  enabled = true 
}: UseChatPresenceOptions): UseChatPresenceReturn {
  const queryClient = useQueryClient();
  const lastPresenceUpdateRef = useRef<Date | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update presence mutation
  const updatePresenceMutation = useMutation({
    mutationFn: async (isOnline: boolean = true) => {
      const abortController = new AbortController();

      // Auto-abort after 8 seconds to prevent hanging requests
      const timeoutId = setTimeout(() => abortController.abort(), 8000);

      try {
        const response = await fetch(`/api/projects/${projectId}/presence`, {
          method: isOnline ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isOnline }),
          signal: abortController.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Silently fail for presence updates
          return null;
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        // Silently ignore timeout and network errors for presence
        return null;
      }
    },
    onSuccess: (data, isOnline) => {
      if (isOnline && data) {
        queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
          const filtered = old.filter(member => member.userId !== currentUserId);
          return [...filtered, data];
        });
      } else if (!isOnline) {
        queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
          return old.filter(member => member.userId !== currentUserId);
        });
      }
    },
    onError: () => {
      // Silently ignore presence errors - they shouldn't break the chat
    },
    retry: false, // Don't retry presence updates
  });

  // Enhanced activity detection for real-time presence
  const handleUserActivity = useCallback(() => {
    const now = new Date();
    const lastUpdate = lastPresenceUpdateRef.current;
    
    if (!lastUpdate || now.getTime() - lastUpdate.getTime() > 10000) {
      lastPresenceUpdateRef.current = now;
      updatePresenceMutation.mutate(true);
    }
  }, [updatePresenceMutation]);

  // Use the activity detection hook
  useUserActivity({
    onActivity: handleUserActivity,
    debounceMs: 1000,
  });

  // Handle page visibility and user going offline
  useEffect(() => {
    if (!enabled || !projectId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresenceMutation.mutate(false);
      } else {
        lastPresenceUpdateRef.current = new Date();
        updatePresenceMutation.mutate(true);
      }
    };

    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `/api/projects/${projectId}/presence`,
        JSON.stringify({ isOnline: false })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, projectId, updatePresenceMutation]);

  return {
    updatePresence: updatePresenceMutation.mutate,
    lastPresenceUpdateRef,
    presenceIntervalRef,
  };
} 