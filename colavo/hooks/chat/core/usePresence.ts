/**
 * User Presence Hook
 * 
 * This hook manages user presence tracking including online/offline status,
 * activity monitoring, and presence state management with proper caching.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPresence, UsePresenceReturn, PresenceUpdateData } from '@/types/chat';
import { 
  logPresence, 
  logError, 
  getPresenceStatusText, 
  getLastSeenText, 
  sortUsersByPresence 
} from '../utils/chatHelpers';

// ========================================================================================
// Hook Configuration
// ========================================================================================

interface UsePresenceOptions {
  enabled?: boolean;
  heartbeatInterval?: number;
  offlineTimeout?: number;
  autoSetOfflineOnUnload?: boolean;
  trackActivity?: boolean;
}

// ========================================================================================
// Query Keys
// ========================================================================================

const presenceQueryKeys = {
  all: ['presence'] as const,
  project: (projectId: string) => [...presenceQueryKeys.all, projectId] as const,
  user: (projectId: string, userId: string) => [...presenceQueryKeys.project(projectId), 'user', userId] as const,
};

// ========================================================================================
// Main Hook Implementation
// ========================================================================================

/**
 * Hook for managing user presence in a project
 */
export function usePresence(
  projectId: string, 
  currentUserId: string,
  options: UsePresenceOptions = {}
): UsePresenceReturn {
  const {
    enabled = true,
    heartbeatInterval = 15000, // 15 seconds
    offlineTimeout = 30000, // 30 seconds
    autoSetOfflineOnUnload = true,
    trackActivity = true
  } = options;

  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);
  const [currentUserPresence, setCurrentUserPresence] = useState<UserPresence | null>(null);
  
  // Refs for managing intervals and timeouts
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());
  const presenceUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================================================================
  // Fetch Online Members Query
  // ========================================================================================

  const {
    data: onlineMembers = [],
    error: presenceError,
    isLoading
  } = useQuery({
    queryKey: presenceQueryKeys.project(projectId),
    queryFn: async (): Promise<UserPresence[]> => {
      if (!projectId) return [];

      logPresence(`Fetching presence for project: ${projectId}`);
      
      const response = await fetch(`/api/projects/${projectId}/presence`);
      if (!response.ok) {
        throw new Error(`Failed to fetch presence: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform presence data
      const members: UserPresence[] = (data.onlineMembers || []).map((member: any) => ({
        ...member,
        lastSeen: new Date(member.lastSeen),
        createdAt: new Date(member.createdAt),
        updatedAt: new Date(member.updatedAt),
      }));
      
      logPresence(`Fetched ${members.length} online members`);
      
      // Update current user presence if found
      const currentUser = members.find(member => member.userId === currentUserId);
      if (currentUser) {
        setCurrentUserPresence(currentUser);
        setIsOnline(currentUser.isOnline);
      }
      
      return sortUsersByPresence(members);
    },
    enabled: enabled && !!projectId && !!currentUserId,
    staleTime: 30000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ========================================================================================
  // Presence Update Mutation
  // ========================================================================================

  const updatePresenceMutation = useMutation({
    mutationFn: async (presenceData: PresenceUpdateData): Promise<UserPresence> => {
      const { isOnline, status = 'online' } = presenceData;
      
      logPresence(`Updating presence to: ${isOnline ? status : 'offline'}`);
      
      const response = await fetch(`/api/projects/${projectId}/presence`, {
        method: isOnline ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isOnline, 
          status,
          lastActiveAt: new Date().toISOString(),
          currentDevice: getUserDevice()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update presence: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform response
      const presenceData: UserPresence = {
        ...result,
        lastSeen: new Date(result.lastSeen),
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };

      logPresence('Presence updated successfully', { isOnline, status });
      return presenceData;
    },
    onSuccess: (data, variables) => {
      const { isOnline } = variables;
      
      // Update local state
      setIsOnline(isOnline);
      setCurrentUserPresence(data);
      
      // Update cache immediately for instant UI feedback
      queryClient.setQueryData(presenceQueryKeys.project(projectId), (old: UserPresence[] = []) => {
        // Remove existing entry for current user
        const filtered = old.filter(member => member.userId !== currentUserId);
        
        if (isOnline) {
          // Add updated presence
          const updated = [...filtered, data];
          return sortUsersByPresence(updated);
        } else {
          // Just return filtered list (user is offline)
          return filtered;
        }
      });
    },
    onError: (error) => {
      logError('Failed to update presence', error);
    },
  });

  // ========================================================================================
  // Status Update Mutation
  // ========================================================================================

  const setStatusMutation = useMutation({
    mutationFn: async (status: 'online' | 'away' | 'busy'): Promise<UserPresence> => {
      logPresence(`Setting status to: ${status}`);
      
      const response = await fetch(`/api/projects/${projectId}/presence/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();
      return {
        ...result,
        lastSeen: new Date(result.lastSeen),
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    },
    onSuccess: (data) => {
      setCurrentUserPresence(data);
      
      // Update cache
      queryClient.setQueryData(presenceQueryKeys.project(projectId), (old: UserPresence[] = []) => {
        const updated = old.map(member => 
          member.userId === currentUserId ? data : member
        );
        return sortUsersByPresence(updated);
      });
    },
    onError: (error) => {
      logError('Failed to update status', error);
    },
  });

  // ========================================================================================
  // Public API Functions
  // ========================================================================================

  const updatePresence = useCallback(async (
    isOnline: boolean, 
    status: 'online' | 'away' | 'busy' = 'online'
  ): Promise<void> => {
    if (!enabled || !projectId || !currentUserId) return;

    try {
      await updatePresenceMutation.mutateAsync({ 
        isOnline, 
        status,
        lastActiveAt: new Date(),
        currentDevice: getUserDevice()
      });
    } catch (error) {
      logError('Failed to update presence', error);
      throw error;
    }
  }, [enabled, projectId, currentUserId, updatePresenceMutation]);

  const setStatus = useCallback(async (status: 'online' | 'away' | 'busy'): Promise<void> => {
    if (!enabled || !projectId || !currentUserId || !isOnline) return;

    try {
      await setStatusMutation.mutateAsync(status);
    } catch (error) {
      logError('Failed to set status', error);
      throw error;
    }
  }, [enabled, projectId, currentUserId, isOnline, setStatusMutation]);

  // ========================================================================================
  // Utility Functions
  // ========================================================================================

  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineMembers.some(member => member.userId === userId && member.isOnline);
  }, [onlineMembers]);

  const getUserPresence = useCallback((userId: string): UserPresence | undefined => {
    return onlineMembers.find(member => member.userId === userId);
  }, [onlineMembers]);

  const getOnlineCount = useCallback((): number => {
    return onlineMembers.filter(member => member.isOnline).length;
  }, [onlineMembers]);

  // ========================================================================================
  // Activity Tracking
  // ========================================================================================

  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    
    // Debounce presence updates
    if (presenceUpdateTimeoutRef.current) {
      clearTimeout(presenceUpdateTimeoutRef.current);
    }
    
    presenceUpdateTimeoutRef.current = setTimeout(() => {
      if (isOnline && enabled) {
        updatePresence(true, currentUserPresence?.status || 'online');
      }
    }, 1000); // Debounce by 1 second
  }, [isOnline, enabled, updatePresence, currentUserPresence?.status]);

  // ========================================================================================
  // Heartbeat Management
  // ========================================================================================

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (!enabled || !isOnline) return;

      const now = new Date();
      const timeSinceActivity = now.getTime() - lastActivityRef.current.getTime();

      // If user has been inactive for too long, set status to away
      if (timeSinceActivity > offlineTimeout && currentUserPresence?.status !== 'away') {
        setStatus('away');
      } else if (timeSinceActivity < offlineTimeout && currentUserPresence?.status === 'away') {
        setStatus('online');
      }

      // Send heartbeat if user is still considered active
      if (timeSinceActivity < offlineTimeout * 2) {
        updatePresence(true, currentUserPresence?.status || 'online');
      }
    }, heartbeatInterval);
  }, [enabled, isOnline, heartbeatInterval, offlineTimeout, currentUserPresence?.status, setStatus, updatePresence]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // ========================================================================================
  // Effects
  // ========================================================================================

  // Activity tracking effect
  useEffect(() => {
    if (!trackActivity || !enabled) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [trackActivity, enabled, updateActivity]);

  // Heartbeat effect
  useEffect(() => {
    if (enabled && isOnline) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    return stopHeartbeat;
  }, [enabled, isOnline, startHeartbeat, stopHeartbeat]);

  // Page visibility effect
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updateActivity();
        updatePresence(true, 'online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, updatePresence, updateActivity]);

  // Cleanup effect
  useEffect(() => {
    if (!autoSetOfflineOnUnload || !enabled) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability when page is unloading
      navigator.sendBeacon(
        `/api/projects/${projectId}/presence`,
        JSON.stringify({ isOnline: false })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set offline when component unmounts
      if (isOnline) {
        updatePresence(false);
      }
    };
  }, [autoSetOfflineOnUnload, enabled, projectId, isOnline, updatePresence]);

  // ========================================================================================
  // Return Hook Interface
  // ========================================================================================

  return {
    // Data
    onlineMembers,
    isOnline,
    currentUserPresence,
    
    // Actions
    updatePresence,
    setStatus,
    
    // Utility functions
    isUserOnline,
    getUserPresence,
    getOnlineCount,
    
    // Loading states
    isLoading,
    error: presenceError?.message || null,
  };
}

// ========================================================================================
// Helper Functions
// ========================================================================================

/**
 * Detect user's device type
 */
function getUserDevice(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent;
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  
  return 'desktop';
}

// ========================================================================================
// Export Hook and Utilities
// ========================================================================================

export default usePresence;

// Export query keys for external cache management
export { presenceQueryKeys };