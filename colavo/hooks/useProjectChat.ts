import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ChatMessage, UserPresence } from '@/types';
import { useChatMutations, useChatPresence, useChatTyping } from './chat';

interface UseChatOptions {
  enabled?: boolean;
  pageSize?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (content: string, replyTo?: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  onlineMembers: UserPresence[];
  isLoading: boolean;
  isConnected: boolean;
  hasMore: boolean;
  error: string | null;
  startTyping: () => void;
  stopTyping: () => void;
  isTyping: string[];
}

export function useProjectChat(
  projectId: string,
  currentUserId: string,
  options: UseChatOptions = {}
): UseChatReturn {
  const { enabled = true, pageSize = 50 } = options;
  const queryClient = useQueryClient();
  
  // State management for real-time features
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for managing subscriptions with cleanup tracking
  const messageChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const cleanupExecutedRef = useRef<boolean>(false);
  const isUnmountedRef = useRef<boolean>(false);

  // Use modular hooks
  const { sendMessage, updateMessage, deleteMessage } = useChatMutations({ projectId });
  const { updatePresence } = useChatPresence({
    projectId,
    currentUserId,
    enabled,
  });
  const { startTyping, stopTyping } = useChatTyping({
    projectId,
    currentUserId,
    enabled,
    presenceChannelRef,
  });

  // Fetch messages with React Query
  const {
    data: messagesData,
    error: messagesError,
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ['chat-messages', projectId],
    queryFn: async (): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
      const response = await fetch(`/api/projects/${projectId}/chat?limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      return { messages: data.messages, hasMore: data.hasMore };
    },
    enabled: enabled && !!projectId && !!currentUserId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Fetch online members with React Query
  const {
    data: onlineMembers = [],
    error: presenceError,
  } = useQuery({
    queryKey: ['chat-presence', projectId],
    queryFn: async (): Promise<UserPresence[]> => {
      const response = await fetch(`/api/projects/${projectId}/presence`);
      if (!response.ok) {
        throw new Error('Failed to fetch presence');
      }
      const data = await response.json();
      return data.onlineMembers || [];
    },
    enabled: enabled && !!projectId && !!currentUserId,
    staleTime: 15000,
    refetchInterval: () => {
      // Stop polling if page is not visible or no data
      // Guard against SSR by checking if document exists
      if (typeof document === 'undefined' || document.hidden) {
        return false;
      }
      return 30000;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Consolidated heartbeat for all polling needs
  useEffect(() => {
    if (!enabled || !projectId || !currentUserId) return;

    // Single interval for both message polling and presence heartbeat
    const heartbeatInterval = setInterval(() => {
      // Only poll if page is visible to save resources
      if (!document.hidden) {
        queryClient.invalidateQueries({ 
          queryKey: ['chat-messages', projectId],
          refetchType: 'active'
        });
      }
    }, 10000); // Reduced frequency to 10 seconds

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [projectId, currentUserId, enabled, queryClient]);

  const messages = messagesData?.messages || [];
  const hasMore = messagesData?.hasMore || false;
  const error = messagesError?.message || presenceError?.message || null;

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    // Pagination will be implemented when needed
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enabled || !projectId || !currentUserId) return;

    let mounted = true;

    // Initialize presence
    updatePresence(true);

    // Set up message subscription
    const messageChannel = supabase
      .channel(`project_${projectId}_messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (_) => {
          if (!mounted) return;
          queryClient.invalidateQueries({ 
            queryKey: ['chat-messages', projectId],
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
        (_) => {
          if (!mounted) return;
          queryClient.invalidateQueries({ 
            queryKey: ['chat-messages', projectId],
            refetchType: 'active'
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
          if (!mounted) return;
          
          queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
            if (!old) return old;
            
            const deletedId = payload.old?.id;
            if (!deletedId) return old;
            
            return {
              ...old,
              messages: old.messages.filter((msg: ChatMessage) => msg.id !== deletedId)
            };
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['chat-messages', projectId],
            refetchType: 'active'
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    messageChannelRef.current = messageChannel;

    // Set up presence and typing subscription
    const presenceChannel = supabase
      .channel(`project_${projectId}_presence`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_presence',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          if (!mounted) return;
          
          if (payload.new && payload.new.is_online) {
            try {
              const response = await fetch(`/api/projects/${projectId}/presence`);
              if (response.ok) {
                const data = await response.json();
                queryClient.setQueryData(['chat-presence', projectId], data.onlineMembers || []);
              }
            } catch (error) {
              // Silently handle presence refresh errors
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_presence',
          filter: `project_id=eq.${projectId}`
        },
        async (_) => {
          if (!mounted) return;
          
          try {
            const response = await fetch(`/api/projects/${projectId}/presence`);
            if (response.ok) {
              const data = await response.json();
              queryClient.setQueryData(['chat-presence', projectId], data.onlineMembers || []);
            }
          } catch (error) {
            // Silently handle presence refresh errors
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_presence',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (!mounted) return;
          
          if (payload.old?.user_id) {
            queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
              return old.filter(member => member.userId !== payload.old.user_id);
            });
          }
        }
      )
      .on('broadcast', { event: 'typing_start' }, ({ payload }) => {
        if (!mounted || payload.userId === currentUserId) return;
        
        setIsTyping(prev => {
          if (!prev.includes(payload.userId)) {
            return [...prev, payload.userId];
          }
          return prev;
        });
      })
      .on('broadcast', { event: 'typing_stop' }, ({ payload }) => {
        if (!mounted || payload.userId === currentUserId) return;
        
        setIsTyping(prev => prev.filter(id => id !== payload.userId));
      })
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    // Cleanup function with verification
    return () => {
      mounted = false;
      
      // Prevent multiple cleanup executions
      if (cleanupExecutedRef.current) return;
      cleanupExecutedRef.current = true;
      
      // Clean up presence before removing channels (with error handling)
      try {
        updatePresence(false);
      } catch (error) {
        // Silently handle presence cleanup errors
      }
      
      // Properly unsubscribe from channels with verification
      const channelsToRemove = [];
      
      if (messageChannelRef.current) {
        channelsToRemove.push({
          channel: messageChannelRef.current,
          name: 'message',
          ref: messageChannelRef
        });
      }
      
      if (presenceChannelRef.current) {
        channelsToRemove.push({
          channel: presenceChannelRef.current,
          name: 'presence',
          ref: presenceChannelRef
        });
      }
      
      // Remove all channels with retry logic
      channelsToRemove.forEach(({ channel, name, ref }) => {
        let retryCount = 0;
        const maxRetries = 3;
        
        const attemptRemoval = (): any => {
          try {
            const result = supabase.removeChannel(channel);
            ref.current = null;
            
            // Channel removed successfully
            
            return result;
          } catch (error) {
            retryCount++;
            // Error removing channel, will retry
            
            if (retryCount < maxRetries) {
              // Retry after a short delay
              setTimeout(attemptRemoval, 100 * retryCount);
              return null;
            } else {
              // Force cleanup after max retries
              ref.current = null;
              // Failed to remove channel after max retries
              return null;
            }
          }
        };
        
        attemptRemoval();
      });
      
      // Reset cleanup flag after a delay for potential re-initialization
      setTimeout(() => {
        cleanupExecutedRef.current = false;
      }, 1000);
    };
  }, [projectId, currentUserId, enabled, updatePresence, queryClient]);

  // Final cleanup on component unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  return {
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMoreMessages,
    onlineMembers,
    isLoading: isLoadingMessages,
    isConnected,
    hasMore,
    error,
    startTyping,
    stopTyping,
    isTyping,
  };
} 