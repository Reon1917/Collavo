import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ChatMessage, UserPresence, CreateChatMessageData } from '@/types';
import { toast } from 'sonner';
import { useUserActivity } from './useUserActivity';

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

  // Refs for managing subscriptions and typing timeout
  const messageChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPresenceUpdateRef = useRef<Date | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages with React Query
  const {
    data: messagesData,
    error: messagesError,
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ['chat-messages', projectId],
    queryFn: async (): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
      console.log('Fetching messages for project:', projectId);
      const response = await fetch(`/api/projects/${projectId}/chat?limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      console.log('Fetched messages:', data.messages.length);
      // Messages are already in correct order (oldest first, newest last)
      return { messages: data.messages, hasMore: data.hasMore };
    },
    enabled: enabled && !!projectId && !!currentUserId,
    staleTime: 0, // Always consider data stale for real-time updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Fetch online members with React Query - more responsive settings
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
      console.log('👥 PRESENCE: Fetched online members:', data.onlineMembers?.length || 0);
      return data.onlineMembers || [];
    },
    enabled: enabled && !!projectId && !!currentUserId,
    staleTime: 10000, // Consider data fresh for 10 seconds (more responsive)
    refetchInterval: 20000, // Auto-refresh every 20 seconds
    refetchOnWindowFocus: true, // Refresh when user comes back to tab
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Add polling as fallback for real-time updates
  useEffect(() => {
    if (!enabled || !projectId || !currentUserId) return;

    const interval = setInterval(() => {
      console.log('Polling for new messages...');
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    }, 5000); // Poll every 5 seconds as fallback

    return () => clearInterval(interval);
  }, [projectId, currentUserId, enabled, queryClient]);

  const messages = messagesData?.messages || [];
  const hasMore = messagesData?.hasMore || false;
  const error = messagesError?.message || presenceError?.message || null;

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, replyTo }: { content: string; replyTo?: string | undefined }) => {
      const messageData: CreateChatMessageData = {
        content: content.trim(),
        replyTo: replyTo || null
      };

      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Immediately update cache for our own messages
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update message');
      }

      return response.json();
    },
    onMutate: async ({ messageId, content }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['chat-messages', projectId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['chat-messages', projectId]);

      // Optimistically update the cache
      queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          messages: old.messages.map((msg: ChatMessage) => 
            msg.id === messageId
              ? { 
                  ...msg, 
                  content: content.trim(),
                  isEdited: true,
                  editedAt: new Date(),
                  updatedAt: new Date()
                }
              : msg
          )
        };
      });

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', projectId], context.previousMessages);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      console.log('🗑️ DELETE: Starting deletion for message:', messageId);
      
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'DELETE'
      });

      console.log('🗑️ DELETE: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🗑️ DELETE: Error response:', errorData);
        throw new Error(errorData.error || 'Failed to delete message');
      }

      const result = await response.json();
      console.log('🗑️ DELETE: Success response:', result);
      return result;
    },
    onMutate: async (messageId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['chat-messages', projectId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['chat-messages', projectId]);

      // Optimistically remove the message from the cache
      queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          messages: old.messages.filter((msg: ChatMessage) => msg.id !== messageId)
        };
      });

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', projectId], context.previousMessages);
      }
      console.error('🗑️ DELETE: Error callback triggered:', error);
      toast.error(error.message);
    },
    onSuccess: () => {
      console.log('🗑️ DELETE: Success callback triggered');
      toast.success('Message deleted successfully');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    },
  });

  // Update presence mutation with better error handling and cache updates
  const updatePresenceMutation = useMutation({
    mutationFn: async (isOnline: boolean = true) => {
      console.log('🟢 PRESENCE: Updating presence to:', isOnline ? 'online' : 'offline');
      
      const response = await fetch(`/api/projects/${projectId}/presence`, {
        method: isOnline ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline })
      });

      if (!response.ok) {
        throw new Error('Failed to update presence');
      }

      const result = await response.json();
      console.log('🟢 PRESENCE: Update successful:', result);
      return result;
    },
    onSuccess: (data, isOnline) => {
      // Immediately update the presence cache for instant UI feedback
      if (isOnline && data) {
        queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
          // Remove existing entry for current user and add updated one
          const filtered = old.filter(member => member.userId !== currentUserId);
          return [...filtered, data];
        });
      } else if (!isOnline) {
        queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
          return old.filter(member => member.userId !== currentUserId);
        });
      }
    },
    onError: (error) => {
      console.error('🔴 PRESENCE: Failed to update presence:', error);
    },
  });

  // Enhanced activity detection for real-time presence
  const handleUserActivity = useCallback(() => {
    const now = new Date();
    const lastUpdate = lastPresenceUpdateRef.current;
    
    // Only update if more than 10 seconds have passed since last update
    if (!lastUpdate || now.getTime() - lastUpdate.getTime() > 10000) {
      console.log('🟢 ACTIVITY: User activity detected, updating presence');
      lastPresenceUpdateRef.current = now;
      updatePresenceMutation.mutate(true);
    }
  }, [updatePresenceMutation]);

  // Use the activity detection hook
  useUserActivity({
    onActivity: handleUserActivity,
    debounceMs: 1000, // Debounce activity detection by 1 second
  });

  // Wrapper functions for the mutations
  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    await sendMessageMutation.mutateAsync({ content, replyTo: replyTo || undefined });
  }, [sendMessageMutation]);

  const updateMessage = useCallback(async (messageId: string, content: string) => {
    await updateMessageMutation.mutateAsync({ messageId, content });
  }, [updateMessageMutation]);

  const deleteMessage = useCallback(async (messageId: string) => {
    console.log('🗑️ DELETE: deleteMessage called with:', messageId);
    await deleteMessageMutation.mutateAsync(messageId);
  }, [deleteMessageMutation]);

  // Load more messages (pagination) - placeholder for now
  const loadMoreMessages = useCallback(async () => {
    // TODO: Implement pagination with React Query
    console.log('Load more messages - implement pagination');
  }, []);







  // Typing indicators
  const startTyping = useCallback(() => {
    console.log('⌨️ TYPING: startTyping called', { enabled, currentUserId, projectId });
    
    if (!enabled || !currentUserId || !projectId) {
      console.log('⌨️ TYPING: startTyping skipped - missing requirements');
      return;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    console.log('⌨️ TYPING: Sending typing_start event');
    
    // Send typing start event
    const result = presenceChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        userId: currentUserId,
        projectId
      }
    });

    console.log('⌨️ TYPING: Send result:', result);

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      console.log('⌨️ TYPING: Auto-stopping typing after 3 seconds');
      stopTyping();
    }, 3000);
  }, [currentUserId, projectId, enabled]);

  const stopTyping = useCallback(() => {
    console.log('⌨️ TYPING: stopTyping called', { enabled, currentUserId, projectId });
    
    if (!enabled || !currentUserId || !projectId) {
      console.log('⌨️ TYPING: stopTyping skipped - missing requirements');
      return;
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    console.log('⌨️ TYPING: Sending typing_stop event');
    
    // Send typing stop event
    const result = presenceChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        userId: currentUserId,
        projectId
      }
    });

    console.log('⌨️ TYPING: Send result:', result);
  }, [currentUserId, projectId, enabled]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enabled || !projectId || !currentUserId) return;

    console.log('Setting up real-time subscriptions for project:', projectId);
    let mounted = true;

    // Initialize presence
    updatePresenceMutation.mutate(true);

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
        (payload) => {
          if (!mounted) return;
          console.log('Real-time INSERT event received:', payload);
          // Immediately invalidate and refetch for new messages
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
        (payload) => {
          if (!mounted) return;
          console.log('Real-time UPDATE event received:', payload);
          // Immediately invalidate and refetch for message updates
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
          console.log('🗑️ DELETE: Real-time DELETE event received:', payload);
          console.log('🗑️ DELETE: Payload details:', {
            eventType: payload.eventType,
            old: payload.old,
            new: payload.new,
            table: payload.table,
            schema: payload.schema,
            commit_timestamp: payload.commit_timestamp
          });
          
          // Immediately update the cache by removing the deleted message
          queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
            if (!old) return old;
            
            const deletedId = payload.old?.id;
            if (!deletedId) return old;
            
            console.log('🗑️ DELETE: Removing message from cache:', deletedId);
            return {
              ...old,
              messages: old.messages.filter((msg: ChatMessage) => msg.id !== deletedId)
            };
          });
          
          // Also invalidate and refetch to ensure consistency
          queryClient.invalidateQueries({ 
            queryKey: ['chat-messages', projectId],
            refetchType: 'active'
          });
        }
      )
      .subscribe((status) => {
        console.log('Message channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    messageChannelRef.current = messageChannel;

    // Set up presence and typing subscription with real-time cache updates
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
          console.log('🟢 PRESENCE: User came online:', payload.new);
          
          // Directly update cache for immediate UI response
          if (payload.new && payload.new.is_online) {
            // Fetch user details for the new online user
            try {
              const response = await fetch(`/api/projects/${projectId}/presence`);
              if (response.ok) {
                const data = await response.json();
                queryClient.setQueryData(['chat-presence', projectId], data.onlineMembers || []);
              }
            } catch (error) {
              console.error('Failed to refresh presence data:', error);
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
        async (payload) => {
          if (!mounted) return;
          console.log('🔄 PRESENCE: User presence updated:', payload.new);
          
          // Refresh presence data for updates
          try {
            const response = await fetch(`/api/projects/${projectId}/presence`);
            if (response.ok) {
              const data = await response.json();
              queryClient.setQueryData(['chat-presence', projectId], data.onlineMembers || []);
            }
          } catch (error) {
            console.error('Failed to refresh presence data:', error);
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
          console.log('🔴 PRESENCE: User went offline:', payload.old);
          
          // Remove user from cache immediately
          if (payload.old?.user_id) {
            queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
              return old.filter(member => member.userId !== payload.old.user_id);
            });
          }
        }
      )
      .on('broadcast', { event: 'typing_start' }, ({ payload }) => {
        console.log('⌨️ TYPING: typing_start event received:', payload);
        if (!mounted || payload.userId === currentUserId) {
          console.log('⌨️ TYPING: typing_start ignored - not mounted or own user');
          return;
        }
        
        console.log('⌨️ TYPING: Adding user to typing list:', payload.userId);
        setIsTyping(prev => {
          if (!prev.includes(payload.userId)) {
            const newTyping = [...prev, payload.userId];
            console.log('⌨️ TYPING: New typing list:', newTyping);
            return newTyping;
          }
          console.log('⌨️ TYPING: User already in typing list');
          return prev;
        });
      })
      .on('broadcast', { event: 'typing_stop' }, ({ payload }) => {
        console.log('⌨️ TYPING: typing_stop event received:', payload);
        if (!mounted || payload.userId === currentUserId) {
          console.log('⌨️ TYPING: typing_stop ignored - not mounted or own user');
          return;
        }
        
        console.log('⌨️ TYPING: Removing user from typing list:', payload.userId);
        setIsTyping(prev => {
          const newTyping = prev.filter(id => id !== payload.userId);
          console.log('⌨️ TYPING: New typing list:', newTyping);
          return newTyping;
        });
      })
      .subscribe((status) => {
        console.log('Presence channel status:', status);
      });

    presenceChannelRef.current = presenceChannel;

    // Set initial presence
    updatePresenceMutation.mutate(true);

    // Set up heartbeat interval for active users (every 15 seconds)
    presenceIntervalRef.current = setInterval(() => {
      if (mounted) {
        const now = new Date();
        const lastUpdate = lastPresenceUpdateRef.current;
        
        // Send heartbeat if user has been active in the last 2 minutes
        if (lastUpdate && now.getTime() - lastUpdate.getTime() < 2 * 60 * 1000) {
          console.log('💓 HEARTBEAT: Sending presence heartbeat');
          updatePresenceMutation.mutate(true);
        }
      }
    }, 15000); // Every 15 seconds

    // Cleanup function
    return () => {
      mounted = false;
      
      // Stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Clear presence interval
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      
      // Set user offline
      updatePresenceMutation.mutate(false);
      
      // Unsubscribe from channels
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [projectId, currentUserId, enabled, updatePresenceMutation.mutate]);

  // Handle page visibility and user going offline
  useEffect(() => {
    if (!enabled || !projectId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 VISIBILITY: Page hidden, user going offline');
        updatePresenceMutation.mutate(false);
      } else {
        console.log('📱 VISIBILITY: Page visible, user coming online');
        lastPresenceUpdateRef.current = new Date();
        updatePresenceMutation.mutate(true);
      }
    };

    const handleBeforeUnload = () => {
      console.log('🚪 UNLOAD: User leaving page, going offline');
      // Use sendBeacon for reliability when page is unloading
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