/**
 * Chat Mutations Hook
 * 
 * This hook handles all chat message mutations (send, update, delete) with
 * optimistic updates, error handling, and proper cache management.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  ChatMessage, 
  CreateChatMessageData, 
  UpdateChatMessageData, 
  UseChatMutationsReturn 
} from '@/types/chat';
import { logChat, logError, generateTempId, validateMessageContent } from '../utils/chatHelpers';
import { chatMessagesQueryKeys } from './useChatMessages';

// ========================================================================================
// Hook Implementation
// ========================================================================================

/**
 * Hook for managing chat message mutations with optimistic updates
 */
export function useChatMutations(projectId: string): UseChatMutationsReturn {
  const queryClient = useQueryClient();

  // ========================================================================================
  // Send Message Mutation
  // ========================================================================================

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, replyTo }: { content: string; replyTo?: string }): Promise<ChatMessage> => {
      logChat('Sending message...', { content: content.substring(0, 50) + '...', replyTo });
      
      // Validate content
      const validation = validateMessageContent(content);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid message content');
      }

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform response to ChatMessage format
      const message: ChatMessage = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        editedAt: data.editedAt ? new Date(data.editedAt) : null,
        isOptimistic: false
      };

      logChat('Message sent successfully', { messageId: message.id });
      return message;
    },
    onMutate: async ({ content, replyTo }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatMessagesQueryKeys.project(projectId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(chatMessagesQueryKeys.project(projectId));

      // Create optimistic message
      const tempId = generateTempId();
      const optimisticMessage: ChatMessage = {
        id: tempId,
        projectId,
        userId: 'current-user', // This should be replaced with actual current user ID
        content: content.trim(),
        messageType: 'text',
        createdAt: new Date(),
        updatedAt: new Date(),
        replyTo: replyTo || null,
        isEdited: false,
        editedAt: null,
        user: {
          id: 'current-user',
          name: 'You',
          image: null
        },
        parentMessage: replyTo ? undefined : undefined, // Would need to fetch parent message
        isFromCurrentUser: true,
        isOptimistic: true,
        tempId
      };

      // Optimistically update the cache
      queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
        if (!old) return { messages: [optimisticMessage], hasMore: false, total: 1 };
        
        return {
          ...old,
          messages: [...old.messages, optimisticMessage],
          total: (old.total || old.messages.length) + 1
        };
      });

      // Return context for error rollback
      return { previousMessages, tempId };
    },
    onSuccess: (data, variables, context) => {
      logChat('Send message mutation succeeded');
      
      // Remove optimistic message and add real message
      queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
        if (!old) return { messages: [data], hasMore: false, total: 1 };
        
        // Remove optimistic message and add real message
        const messagesWithoutOptimistic = old.messages.filter(
          (msg: ChatMessage) => msg.tempId !== context?.tempId
        );
        
        return {
          ...old,
          messages: [...messagesWithoutOptimistic, data],
          total: Math.max(old.total || old.messages.length, messagesWithoutOptimistic.length + 1)
        };
      });
    },
    onError: (error, variables, context) => {
      logError('Failed to send message', error);
      
      // Rollback optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), context.previousMessages);
      }
      
      // Show error toast
      toast.error(error.message || 'Failed to send message');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: chatMessagesQueryKeys.project(projectId),
        refetchType: 'active'
      });
    },
  });

  // ========================================================================================
  // Update Message Mutation
  // ========================================================================================

  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }): Promise<ChatMessage> => {
      logChat(`Updating message: ${messageId}`);
      
      // Validate content
      const validation = validateMessageContent(content);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid message content');
      }

      const updateData: UpdateChatMessageData = {
        content: content.trim()
      };

      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update message: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform response
      const message: ChatMessage = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        editedAt: new Date(data.editedAt || data.updatedAt),
        isEdited: true
      };

      logChat('Message updated successfully', { messageId });
      return message;
    },
    onMutate: async ({ messageId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatMessagesQueryKeys.project(projectId) });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(chatMessagesQueryKeys.project(projectId));

      // Optimistically update the message
      queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
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

      return { previousMessages };
    },
    onError: (error, variables, context) => {
      logError('Failed to update message', error);
      
      // Rollback optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), context.previousMessages);
      }
      
      toast.error(error.message || 'Failed to update message');
    },
    onSuccess: (data) => {
      logChat('Message updated successfully');
      toast.success('Message updated');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: chatMessagesQueryKeys.project(projectId),
        refetchType: 'active'
      });
    },
  });

  // ========================================================================================
  // Delete Message Mutation
  // ========================================================================================

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string): Promise<void> => {
      logChat(`Deleting message: ${messageId}`);
      
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete message: ${response.status}`);
      }

      logChat('Message deleted successfully', { messageId });
    },
    onMutate: async (messageId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatMessagesQueryKeys.project(projectId) });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(chatMessagesQueryKeys.project(projectId));

      // Optimistically remove the message
      queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
        if (!old) return old;
        
        const filteredMessages = old.messages.filter((msg: ChatMessage) => msg.id !== messageId);
        
        return {
          ...old,
          messages: filteredMessages,
          total: Math.max((old.total || old.messages.length) - 1, 0)
        };
      });

      return { previousMessages };
    },
    onError: (error, variables, context) => {
      logError('Failed to delete message', error);
      
      // Rollback optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), context.previousMessages);
      }
      
      toast.error(error.message || 'Failed to delete message');
    },
    onSuccess: () => {
      logChat('Message deleted successfully');
      toast.success('Message deleted');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: chatMessagesQueryKeys.project(projectId),
        refetchType: 'active'
      });
    },
  });

  // ========================================================================================
  // Optimistic Update Helpers
  // ========================================================================================

  const addOptimisticMessage = (message: Partial<ChatMessage>): void => {
    const tempId = generateTempId();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      projectId,
      userId: 'current-user',
      content: '',
      messageType: 'text',
      createdAt: new Date(),
      updatedAt: new Date(),
      replyTo: null,
      isEdited: false,
      editedAt: null,
      user: {
        id: 'current-user',
        name: 'You',
        image: null
      },
      isFromCurrentUser: true,
      isOptimistic: true,
      tempId,
      ...message
    };

    queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
      if (!old) return { messages: [optimisticMessage], hasMore: false, total: 1 };
      
      return {
        ...old,
        messages: [...old.messages, optimisticMessage],
        total: (old.total || old.messages.length) + 1
      };
    });
  };

  const removeOptimisticMessage = (tempId: string): void => {
    queryClient.setQueryData(chatMessagesQueryKeys.project(projectId), (old: any) => {
      if (!old) return old;
      
      const filteredMessages = old.messages.filter((msg: ChatMessage) => msg.tempId !== tempId);
      
      return {
        ...old,
        messages: filteredMessages,
        total: Math.max((old.total || old.messages.length) - 1, 0)
      };
    });
  };

  // ========================================================================================
  // Public API
  // ========================================================================================

  const sendMessage = async (content: string, replyTo?: string): Promise<ChatMessage> => {
    return await sendMessageMutation.mutateAsync({ content, replyTo });
  };

  const updateMessage = async (messageId: string, content: string): Promise<ChatMessage> => {
    return await updateMessageMutation.mutateAsync({ messageId, content });
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    await deleteMessageMutation.mutateAsync(messageId);
  };

  // ========================================================================================
  // Return Hook Interface
  // ========================================================================================

  return {
    // Message operations
    sendMessage,
    updateMessage,
    deleteMessage,
    
    // Operation states
    isSending: sendMessageMutation.isPending,
    isUpdating: updateMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
    
    // Optimistic updates
    addOptimisticMessage,
    removeOptimisticMessage,
  };
}

// ========================================================================================
// Export Hook
// ========================================================================================

export default useChatMutations;