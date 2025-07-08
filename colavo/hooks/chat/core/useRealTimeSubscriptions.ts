/**
 * Real-time Subscriptions Hook
 * 
 * This hook manages Supabase real-time subscriptions for chat features including
 * message updates, presence changes, and typing indicators with proper error handling
 * and reconnection logic.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ChatMessage, 
  SubscriptionStatus, 
  RealTimeEvent, 
  TypingEventPayload,
  UseRealTimeSubscriptionsReturn 
} from '@/types/chat';
import { subscriptionManager } from '../utils/subscriptionManager';
import { logRealTime, logError } from '../utils/chatHelpers';
import { chatMessagesQueryKeys } from './useChatMessages';
import { presenceQueryKeys } from './usePresence';

// ========================================================================================
// Hook Configuration
// ========================================================================================

interface UseRealTimeSubscriptionsOptions {
  enabled?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnectionChange?: (status: SubscriptionStatus) => void;
  onError?: (error: Error) => void;
  onTypingStart?: (userId: string, payload: TypingEventPayload) => void;
  onTypingStop?: (userId: string, payload: TypingEventPayload) => void;
  onPresenceChange?: () => void;
  onMessageEvent?: (event: RealTimeEvent) => void;
}

// ========================================================================================
// Main Hook Implementation
// ========================================================================================

/**
 * Hook for managing real-time subscriptions with automatic reconnection
 */
export function useRealTimeSubscriptions(
  projectId: string,
  currentUserId: string,
  options: UseRealTimeSubscriptionsOptions = {}
): UseRealTimeSubscriptionsReturn {
  const {
    enabled = true,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onConnectionChange,
    onError,
    onTypingStart,
    onTypingStop,
    onPresenceChange,
    onMessageEvent
  } = options;

  const queryClient = useQueryClient();
  
  // ========================================================================================
  // State Management
  // ========================================================================================

  const [connectionStatus, setConnectionStatus] = useState<SubscriptionStatus>('disconnected');
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for managing subscriptions and intervals
  const mountedRef = useRef(true);
  const messageChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================================================================
  // Connection Status Management
  // ========================================================================================

  const updateConnectionStatus = useCallback((status: SubscriptionStatus) => {
    if (!mountedRef.current) return;

    setConnectionStatus(status);
    
    if (status === 'connected') {
      setLastConnectedAt(new Date());
      setError(null);
      setRetryCount(0);
    }

    logRealTime(`Connection status changed to: ${status}`);
    onConnectionChange?.(status);
  }, [onConnectionChange]);

  const handleError = useCallback((err: Error) => {
    if (!mountedRef.current) return;

    const errorMessage = err.message || 'Unknown subscription error';
    setError(errorMessage);
    logError('Real-time subscription error', err);
    onError?.(err);
  }, [onError]);

  // ========================================================================================
  // Message Subscription Management
  // ========================================================================================

  const setupMessageSubscription = useCallback(() => {
    if (!enabled || !projectId || !mountedRef.current) return null;

    logRealTime(`Setting up message subscription for project: ${projectId}`);

    try {
      const messageChannel = subscriptionManager.createChannel(`project_${projectId}_messages`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            if (!mountedRef.current) return;
            
            logRealTime('New message received via real-time');
            
            const event: RealTimeEvent = {
              type: 'message_inserted',
              payload: payload.new,
              timestamp: new Date().toISOString(),
              userId: payload.new?.user_id,
              projectId
            };

            onMessageEvent?.(event);
            
            // Invalidate messages query to fetch new data
            queryClient.invalidateQueries({ 
              queryKey: chatMessagesQueryKeys.project(projectId),
              refetchType: 'active'
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            if (!mountedRef.current) return;
            
            logRealTime('Message updated via real-time');
            
            const event: RealTimeEvent = {
              type: 'message_updated',
              payload: payload.new,
              timestamp: new Date().toISOString(),
              userId: payload.new?.user_id,
              projectId
            };

            onMessageEvent?.(event);
            
            // Update specific message in cache
            queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
              if (!old) return old;
              
              return {
                ...old,
                messages: old.messages.map((msg: ChatMessage) => 
                  msg.id === payload.new?.id 
                    ? {
                        ...msg,
                        ...payload.new,
                        updatedAt: new Date(payload.new.updated_at),
                        editedAt: payload.new.edited_at ? new Date(payload.new.edited_at) : null,
                        isEdited: true
                      }
                    : msg
                )
              };
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            if (!mountedRef.current) return;
            
            logRealTime('Message deleted via real-time');
            
            const event: RealTimeEvent = {
              type: 'message_deleted',
              payload: { id: payload.old?.id, projectId },
              timestamp: new Date().toISOString(),
              userId: payload.old?.user_id,
              projectId
            };

            onMessageEvent?.(event);
            
            // Remove message from cache
            queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
              if (!old) return old;
              
              return {
                ...old,
                messages: old.messages.filter((msg: ChatMessage) => msg.id !== payload.old?.id),
                total: Math.max((old.total || old.messages.length) - 1, 0)
              };
            });
          }
        )
        .subscribe((status) => {
          logRealTime(`Message channel status: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            updateConnectionStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            updateConnectionStatus('error');
            handleError(new Error('Message channel subscription failed'));
          } else if (status === 'CLOSED') {
            updateConnectionStatus('disconnected');
          }
        });

      return messageChannel;
    } catch (error) {
      handleError(new Error(`Failed to setup message subscription: ${error}`));
      return null;
    }
  }, [enabled, projectId, queryClient, onMessageEvent, updateConnectionStatus, handleError]);

  // ========================================================================================
  // Presence Subscription Management
  // ========================================================================================

  const setupPresenceSubscription = useCallback(() => {
    if (!enabled || !projectId || !mountedRef.current) return null;

    logRealTime(`Setting up presence subscription for project: ${projectId}`);

    try {
      const presenceChannel = subscriptionManager.createChannel(`project_${projectId}_presence`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_presence',
            filter: `project_id=eq.${projectId}`
          },
          async (payload) => {
            if (!mountedRef.current) return;
            
            logRealTime('Presence changed via real-time', payload);
            
            // Refresh presence data
            queryClient.invalidateQueries({ 
              queryKey: presenceQueryKeys.project(projectId),
              refetchType: 'active'
            });
            
            onPresenceChange?.();
          }
        )
        .on('broadcast', { event: 'typing_start' }, ({ payload }) => {
          if (!mountedRef.current || payload.userId === currentUserId) return;
          
          logRealTime(`User started typing: ${payload.userId}`);
          onTypingStart?.(payload.userId, payload);
        })
        .on('broadcast', { event: 'typing_stop' }, ({ payload }) => {
          if (!mountedRef.current || payload.userId === currentUserId) return;
          
          logRealTime(`User stopped typing: ${payload.userId}`);
          onTypingStop?.(payload.userId, payload);
        })
        .subscribe((status) => {
          logRealTime(`Presence channel status: ${status}`);
          
          // Note: We don't update connection status here since message channel is primary
          if (status === 'CHANNEL_ERROR') {
            handleError(new Error('Presence channel subscription failed'));
          }
        });

      return presenceChannel;
    } catch (error) {
      handleError(new Error(`Failed to setup presence subscription: ${error}`));
      return null;
    }
  }, [enabled, projectId, currentUserId, queryClient, onPresenceChange, onTypingStart, onTypingStop, handleError]);

  // ========================================================================================
  // Reconnection Logic
  // ========================================================================================

  const reconnect = useCallback(async () => {
    if (!autoReconnect || !mountedRef.current || retryCount >= maxReconnectAttempts) {
      if (retryCount >= maxReconnectAttempts) {
        logRealTime(`Max reconnection attempts reached (${maxReconnectAttempts})`);
        updateConnectionStatus('error');
      }
      return;
    }

    logRealTime(`Attempting to reconnect... (attempt ${retryCount + 1})`);
    updateConnectionStatus('connecting');

    try {
      // Clean up existing subscriptions
      if (messageChannelRef.current) {
        subscriptionManager.removeChannel(`project_${projectId}_messages`);
        messageChannelRef.current = null;
      }
      
      if (presenceChannelRef.current) {
        subscriptionManager.removeChannel(`project_${projectId}_presence`);
        presenceChannelRef.current = null;
      }

      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recreate subscriptions
      messageChannelRef.current = setupMessageSubscription();
      presenceChannelRef.current = setupPresenceSubscription();

      if (messageChannelRef.current || presenceChannelRef.current) {
        logRealTime('Reconnection successful');
        setRetryCount(0);
      } else {
        throw new Error('Failed to create subscriptions');
      }
    } catch (error) {
      setRetryCount(prev => prev + 1);
      handleError(new Error(`Reconnection failed: ${error}`));
      
      // Schedule next reconnection attempt
      if (retryCount + 1 < maxReconnectAttempts) {
        const delay = Math.min(reconnectInterval * Math.pow(2, retryCount), 30000);
        logRealTime(`Scheduling reconnection in ${delay}ms`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            reconnect();
          }
        }, delay);
      }
    }
  }, [
    autoReconnect, 
    retryCount, 
    maxReconnectAttempts, 
    projectId, 
    reconnectInterval, 
    setupMessageSubscription, 
    setupPresenceSubscription, 
    updateConnectionStatus, 
    handleError
  ]);

  const disconnect = useCallback(() => {
    logRealTime('Manually disconnecting subscriptions');
    
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Remove subscriptions
    if (messageChannelRef.current) {
      subscriptionManager.removeChannel(`project_${projectId}_messages`);
      messageChannelRef.current = null;
    }
    
    if (presenceChannelRef.current) {
      subscriptionManager.removeChannel(`project_${projectId}_presence`);
      presenceChannelRef.current = null;
    }

    updateConnectionStatus('disconnected');
  }, [projectId, updateConnectionStatus]);

  // ========================================================================================
  // Connection Health Monitoring
  // ========================================================================================

  const startConnectionMonitoring = useCallback(() => {
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
    }

    connectionCheckIntervalRef.current = setInterval(() => {
      if (!mountedRef.current || !autoReconnect) return;

      // Check if we should attempt reconnection
      if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
        if (retryCount < maxReconnectAttempts) {
          logRealTime('Connection lost, attempting automatic reconnection');
          reconnect();
        }
      }
    }, 30000); // Check every 30 seconds
  }, [connectionStatus, retryCount, maxReconnectAttempts, autoReconnect, reconnect]);

  const stopConnectionMonitoring = useCallback(() => {
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
  }, []);

  // ========================================================================================
  // Effects
  // ========================================================================================

  // Main subscription setup effect
  useEffect(() => {
    if (!enabled || !projectId || !currentUserId) return;

    logRealTime(`Setting up real-time subscriptions for project: ${projectId}`);
    mountedRef.current = true;
    updateConnectionStatus('connecting');

    // Setup subscriptions
    messageChannelRef.current = setupMessageSubscription();
    presenceChannelRef.current = setupPresenceSubscription();

    // Start connection monitoring
    startConnectionMonitoring();

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      // Clear timeouts and intervals
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopConnectionMonitoring();
      
      // Remove subscriptions
      if (messageChannelRef.current) {
        subscriptionManager.removeChannel(`project_${projectId}_messages`);
      }
      if (presenceChannelRef.current) {
        subscriptionManager.removeChannel(`project_${projectId}_presence`);
      }
      
      updateConnectionStatus('disconnected');
    };
  }, [
    enabled, 
    projectId, 
    currentUserId, 
    setupMessageSubscription, 
    setupPresenceSubscription, 
    startConnectionMonitoring, 
    stopConnectionMonitoring, 
    updateConnectionStatus
  ]);

  // Page visibility effect for connection management
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, we might want to reduce activity
        logRealTime('Page hidden, maintaining connections');
      } else {
        // Page is visible again, ensure connections are healthy
        logRealTime('Page visible, checking connection health');
        if (connectionStatus === 'disconnected' && autoReconnect) {
          reconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, connectionStatus, autoReconnect, reconnect]);

  // ========================================================================================
  // Return Hook Interface
  // ========================================================================================

  return {
    // Connection state
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    lastConnectedAt,
    
    // Channels
    messageChannel: messageChannelRef.current,
    presenceChannel: presenceChannelRef.current,
    
    // Connection management
    reconnect,
    disconnect,
    
    // Error handling
    error,
    retryCount,
  };
}

// ========================================================================================
// Export Hook
// ========================================================================================

export default useRealTimeSubscriptions;