import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatMessage, UserPresence, UseChatReturn, CreateChatMessageData } from '@/types';
import { toast } from 'sonner';

interface UseChatOptions {
  enabled?: boolean;
  pageSize?: number;
}

export function useProjectChat(
  projectId: string,
  currentUserId: string,
  options: UseChatOptions = {}
): UseChatReturn {
  const { enabled = true, pageSize = 50 } = options;
  
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<UserPresence[]>([]);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for managing subscriptions and typing timeout
  const messageChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async (before?: string) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/projects/${projectId}/chat`, window.location.origin);
      url.searchParams.set('limit', pageSize.toString());
      if (before) {
        url.searchParams.set('before', before);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      
      if (before) {
        // Loading more messages (prepend to existing)
        setMessages(prev => [...data.messages, ...prev]);
      } else {
        // Initial load or refresh
        setMessages(data.messages);
      }
      
      setHasMore(data.hasMore);
      
      // Update last message ID for real-time subscription
      if (data.messages.length > 0) {
        lastMessageIdRef.current = data.messages[0].id;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, pageSize, enabled]);

  // Fetch online members
  const fetchOnlineMembers = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/presence`);
      if (!response.ok) return;

      const data = await response.json();
      setOnlineMembers(data.onlineMembers || []);
    } catch (err) {
      console.error('Failed to fetch online members:', err);
    }
  }, [projectId, enabled]);

  // Update presence
  const updatePresence = useCallback(async (isOnline: boolean = true) => {
    if (!enabled) return;

    try {
      await fetch(`/api/projects/${projectId}/presence`, {
        method: isOnline ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline })
      });
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  }, [projectId, enabled]);

  // Send message
  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    if (!enabled) return;

    try {
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

      // Message will be added via real-time subscription
      // But for better UX, we could add an optimistic update here
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      toast.error(errorMessage);
      throw err;
    }
  }, [projectId, enabled]);

  // Update message
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      // Message will be updated via real-time subscription
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update message';
      toast.error(errorMessage);
      throw err;
    }
  }, [projectId]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // Remove message from local state immediately for better UX
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      toast.error(errorMessage);
      throw err;
    }
  }, [projectId]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoading || messages.length === 0) return;

    const oldestMessage = messages[messages.length - 1];
    if (oldestMessage) {
      await fetchMessages(oldestMessage.createdAt.toISOString());
    }
  }, [hasMore, isLoading, messages, fetchMessages]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!enabled) return;

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
    if (!enabled) return;

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
    if (!enabled) return;

    let mounted = true;

    // Initialize data
    fetchMessages();
    fetchOnlineMembers();
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
        (payload) => {
          if (!mounted) return;
          
          const newMessage = payload.new as any;
          const transformedMessage: ChatMessage = {
            id: newMessage.id,
            projectId: newMessage.project_id,
            userId: newMessage.user_id,
            content: newMessage.content,
            messageType: newMessage.message_type,
            createdAt: new Date(newMessage.created_at),
            updatedAt: new Date(newMessage.updated_at),
            replyTo: newMessage.reply_to,
            isEdited: newMessage.is_edited,
            editedAt: newMessage.edited_at ? new Date(newMessage.edited_at) : null
          };

          setMessages(prev => [transformedMessage, ...prev]);
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
          
          const updatedMessage = payload.new as any;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id 
              ? {
                  ...msg,
                  content: updatedMessage.content,
                  isEdited: updatedMessage.is_edited,
                  editedAt: updatedMessage.edited_at ? new Date(updatedMessage.edited_at) : null,
                  updatedAt: new Date(updatedMessage.updated_at)
                }
              : msg
          ));
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
          
          const deletedMessage = payload.old as any;
          setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
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
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          if (!mounted) return;
          // Refetch online members when presence changes
          fetchOnlineMembers();
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

    // Update presence periodically
    const presenceInterval = setInterval(() => {
      if (mounted) {
        updatePresence(true);
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
      updatePresence(false);
      
      // Unsubscribe from channels
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [projectId, currentUserId, enabled, fetchMessages, fetchOnlineMembers, updatePresence]);

  // Handle page visibility change
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
        fetchOnlineMembers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, updatePresence, fetchOnlineMembers]);

  return {
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMoreMessages,
    onlineMembers,
    isLoading,
    isConnected,
    hasMore,
    error,
    startTyping,
    stopTyping,
    isTyping
  };
} 