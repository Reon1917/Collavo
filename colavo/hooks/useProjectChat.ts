import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ChatMessage, UserPresence, CreateChatMessageData } from '@/types';
import { toast } from 'sonner';

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
  // Debug functions
  manualRefresh: () => Promise<void>;
  testRealTime: () => Promise<void>;
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
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
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
        throw new Error('Failed to update message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Immediately update cache for message edits
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Immediately update cache for message deletions
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update presence mutation
  const updatePresenceMutation = useMutation({
    mutationFn: async (isOnline: boolean = true) => {
      const response = await fetch(`/api/projects/${projectId}/presence`, {
        method: isOnline ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline })
      });

      if (!response.ok) {
        throw new Error('Failed to update presence');
      }

      return response.json();
    },
    onError: (error) => {
      console.error('Failed to update presence:', error);
    },
  });

  // Wrapper functions for the mutations
  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    await sendMessageMutation.mutateAsync({ content, replyTo: replyTo || undefined });
  }, [sendMessageMutation]);

  const updateMessage = useCallback(async (messageId: string, content: string) => {
    await updateMessageMutation.mutateAsync({ messageId, content });
  }, [updateMessageMutation]);

  const deleteMessage = useCallback(async (messageId: string) => {
    await deleteMessageMutation.mutateAsync(messageId);
  }, [deleteMessageMutation]);



  // Load more messages (pagination) - placeholder for now
  const loadMoreMessages = useCallback(async () => {
    // TODO: Implement pagination with React Query
    console.log('Load more messages - implement pagination');
  }, []);

  // Manual refresh function for debugging
  const manualRefresh = useCallback(async () => {
    console.log('Manual refresh triggered');
    queryClient.invalidateQueries({ 
      queryKey: ['chat-messages', projectId],
      refetchType: 'active'
    });
  }, [queryClient, projectId]);

  // Test real-time connection
  const testRealTime = useCallback(async () => {
    console.log('Testing real-time connection...');
    
    // Create a test channel to check if real-time is working
    const testChannel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('Test real-time event received:', payload);
      })
      .subscribe((status) => {
        console.log('Test channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time is working!');
        } else {
          console.log('❌ Real-time subscription failed:', status);
        }
      });

    // Clean up after 10 seconds
    setTimeout(() => {
      supabase.removeChannel(testChannel);
      console.log('Test channel cleaned up');
    }, 10000);
  }, []);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!enabled || !currentUserId || !projectId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start event
    presenceChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        userId: currentUserId,
        projectId
      }
    });

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [currentUserId, projectId, enabled]);

  const stopTyping = useCallback(() => {
    if (!enabled || !currentUserId || !projectId) return;

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send typing stop event
    presenceChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        userId: currentUserId,
        projectId
      }
    });
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
          console.log('Real-time DELETE event received:', payload);
          // Immediately invalidate and refetch for message deletions
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

    // Set up presence and typing subscription
    const presenceChannel = supabase
      .channel(`project_${projectId}_presence`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (!mounted) return;
          console.log('Real-time presence event received:', payload);
          queryClient.invalidateQueries({ 
            queryKey: ['chat-presence', projectId],
            refetchType: 'active'
          });
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
      .subscribe((status) => {
        console.log('Presence channel status:', status);
      });

    presenceChannelRef.current = presenceChannel;

    // Update presence periodically
    const presenceInterval = setInterval(() => {
      if (mounted) {
        updatePresenceMutation.mutate(true);
      }
    }, 30000); // Every 30 seconds

    // Cleanup function
    return () => {
      mounted = false;
      
      // Stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Clear presence interval
      clearInterval(presenceInterval);
      
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

  // Handle page visibility change
  useEffect(() => {
    if (!enabled || !projectId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresenceMutation.mutate(false);
      } else {
        updatePresenceMutation.mutate(true);
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: ['chat-presence', projectId],
            refetchType: 'active'
          });
        }, 200);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, projectId]);

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
    // Debug functions
    manualRefresh,
    testRealTime,
  };
} 