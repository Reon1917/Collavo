/**
 * Chat Messages Hook
 * 
 * This hook handles message fetching, pagination, and caching using React Query.
 * It provides a clean interface for managing chat messages with proper loading states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatMessage, UseChatMessagesReturn, ChatHookOptions } from '@/types/chat';
import { logChat, logError } from '../utils/chatHelpers';

// ========================================================================================
// Hook Options & Configuration
// ========================================================================================

interface UseChatMessagesOptions extends ChatHookOptions {
  enabled?: boolean;
  pageSize?: number;
  staleTime?: number;
  gcTime?: number;
  includeReplies?: boolean;
  sortOrder?: 'asc' | 'desc';
}

// ========================================================================================
// Main Hook Implementation
// ========================================================================================

/**
 * Hook for managing chat messages with pagination and caching
 */
export function useChatMessages(
  projectId: string,
  options: UseChatMessagesOptions = {}
): UseChatMessagesReturn {
  const {
    enabled = true,
    pageSize = 50,
    staleTime = 30000, // 30 seconds
    gcTime = 5 * 60 * 1000, // 5 minutes
    includeReplies = true,
    sortOrder = 'asc'
  } = options;

  const queryClient = useQueryClient();

  // ========================================================================================
  // Query Key Management
  // ========================================================================================

  const getQueryKey = (projectId: string) => ['chat-messages', projectId];

  // ========================================================================================
  // Message Fetching Query
  // ========================================================================================

  const {
    data: messagesData,
    error: messagesError,
    isLoading,
    isLoadingError,
    refetch
  } = useQuery({
    queryKey: getQueryKey(projectId),
    queryFn: async (): Promise<{ messages: ChatMessage[]; hasMore: boolean; total: number }> => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      logChat(`Fetching messages for project: ${projectId}`);
      
      try {
        const searchParams = new URLSearchParams({
          limit: pageSize.toString(),
          includeReplies: includeReplies.toString(),
          sortOrder
        });

        const response = await fetch(`/api/projects/${projectId}/chat?${searchParams}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch messages: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate response structure
        if (!data || !Array.isArray(data.messages)) {
          throw new Error('Invalid response format from messages API');
        }

        // Transform messages to ensure proper typing
        const messages: ChatMessage[] = data.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
          updatedAt: new Date(msg.updatedAt),
          editedAt: msg.editedAt ? new Date(msg.editedAt) : null,
          isFromCurrentUser: false, // This will be set by the parent component
          isOptimistic: false
        }));

        logChat(`Fetched ${messages.length} messages`, {
          total: data.total || messages.length,
          hasMore: data.hasMore || false
        });

        return {
          messages,
          hasMore: data.hasMore || false,
          total: data.total || messages.length
        };
      } catch (error) {
        logError('Failed to fetch messages', error);
        throw error;
      }
    },
    enabled: enabled && !!projectId,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        if (errorMessage.includes('400') || errorMessage.includes('404') || errorMessage.includes('403')) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ========================================================================================
  // Pagination State Management
  // ========================================================================================

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [paginationCursor, setPaginationCursor] = useState<string | null>(null);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async (): Promise<void> => {
    if (!enabled || !projectId || isLoadingMore || !messagesData?.hasMore) {
      return;
    }

    setIsLoadingMore(true);
    logChat('Loading more messages...');

    try {
      const oldestMessage = messagesData.messages[0];
      const beforeCursor = oldestMessage?.id;

      const searchParams = new URLSearchParams({
        limit: pageSize.toString(),
        before: beforeCursor || '',
        includeReplies: includeReplies.toString(),
        sortOrder
      });

      const response = await fetch(`/api/projects/${projectId}/chat?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load more messages');
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data.messages)) {
        throw new Error('Invalid response format');
      }

      // Transform new messages
      const newMessages: ChatMessage[] = data.messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        updatedAt: new Date(msg.updatedAt),
        editedAt: msg.editedAt ? new Date(msg.editedAt) : null,
        isFromCurrentUser: false,
        isOptimistic: false
      }));

      // Update query cache with merged messages
      queryClient.setQueryData(getQueryKey(projectId), (oldData: any) => {
        if (!oldData) return { messages: newMessages, hasMore: data.hasMore, total: data.total };

        // Merge messages (new messages at the beginning for chronological order)
        const mergedMessages = [...newMessages, ...oldData.messages];
        
        // Remove duplicates based on message ID
        const uniqueMessages = mergedMessages.filter((msg, index, arr) => 
          arr.findIndex(m => m.id === msg.id) === index
        );

        return {
          messages: uniqueMessages,
          hasMore: data.hasMore,
          total: Math.max(oldData.total || 0, data.total || uniqueMessages.length)
        };
      });

      logChat(`Loaded ${newMessages.length} more messages`);
      
    } catch (error) {
      logError('Failed to load more messages', error);
      throw error;
    } finally {
      setIsLoadingMore(false);
    }
  }, [enabled, projectId, isLoadingMore, messagesData, pageSize, includeReplies, sortOrder, queryClient]);

  // ========================================================================================
  // Cache Management Functions
  // ========================================================================================

  const refetchMessages = useCallback((): void => {
    logChat('Manually refetching messages');
    queryClient.invalidateQueries({ 
      queryKey: getQueryKey(projectId),
      refetchType: 'active'
    });
  }, [projectId, queryClient]);

  // ========================================================================================
  // Utility Functions
  // ========================================================================================

  const getMessageById = useCallback((id: string): ChatMessage | undefined => {
    return messagesData?.messages.find(msg => msg.id === id);
  }, [messagesData?.messages]);

  const getMessagesByUser = useCallback((userId: string): ChatMessage[] => {
    return messagesData?.messages.filter(msg => msg.userId === userId) || [];
  }, [messagesData?.messages]);

  const getUnreadCount = useCallback((): number => {
    // This would typically be based on a lastReadMessageId or timestamp
    // For now, return 0 as it requires additional state management
    return 0;
  }, []);

  // ========================================================================================
  // Error Handling
  // ========================================================================================

  const error = messagesError?.message || null;

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      logError('Messages query error', messagesError);
    }
  }, [error, messagesError]);

  // ========================================================================================
  // Return Hook Interface
  // ========================================================================================

  return {
    // Data
    messages: messagesData?.messages || [],
    isLoading,
    isLoadingMore,
    error,
    hasMore: messagesData?.hasMore || false,
    
    // Actions
    loadMoreMessages,
    refetchMessages,
    
    // Utility functions
    getMessageById,
    getMessagesByUser,
    getUnreadCount
  };
}

// ========================================================================================
// Hook Variants
// ========================================================================================

/**
 * Hook for fetching a single message by ID
 */
export function useChatMessage(projectId: string, messageId: string) {
  return useQuery({
    queryKey: ['chat-message', projectId, messageId],
    queryFn: async (): Promise<ChatMessage | null> => {
      if (!projectId || !messageId) return null;

      logChat(`Fetching message: ${messageId}`);
      
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch message');
      }

      const data = await response.json();
      
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        editedAt: data.editedAt ? new Date(data.editedAt) : null,
      };
    },
    enabled: !!projectId && !!messageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching message replies
 */
export function useMessageReplies(projectId: string, parentMessageId: string) {
  return useQuery({
    queryKey: ['message-replies', projectId, parentMessageId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!projectId || !parentMessageId) return [];

      logChat(`Fetching replies for message: ${parentMessageId}`);
      
      const response = await fetch(
        `/api/projects/${projectId}/chat/${parentMessageId}/replies`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch message replies');
      }

      const data = await response.json();
      
      return data.replies.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        updatedAt: new Date(msg.updatedAt),
        editedAt: msg.editedAt ? new Date(msg.editedAt) : null,
      }));
    },
    enabled: !!projectId && !!parentMessageId,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ========================================================================================
// Export Hook and Utilities
// ========================================================================================

export default useChatMessages;

// Export query key factory for external cache management
export const chatMessagesQueryKeys = {
  all: ['chat-messages'] as const,
  project: (projectId: string) => [...chatMessagesQueryKeys.all, projectId] as const,
  message: (projectId: string, messageId: string) => ['chat-message', projectId, messageId] as const,
  replies: (projectId: string, messageId: string) => ['message-replies', projectId, messageId] as const,
};