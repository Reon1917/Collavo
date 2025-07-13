import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChatMessage, CreateChatMessageData } from '@/types';

interface UseChatMutationsOptions {
  projectId: string;
}

interface UseChatMutationsReturn {
  sendMessage: (content: string, replyTo?: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  isSending: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useChatMutations({ projectId }: UseChatMutationsOptions): UseChatMutationsReturn {
  const queryClient = useQueryClient();

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
      await queryClient.cancelQueries({ queryKey: ['chat-messages', projectId] });
      const previousMessages = queryClient.getQueryData(['chat-messages', projectId]);

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

      return { previousMessages };
    },
    onError: (error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', projectId], context.previousMessages);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }

      return response.json();
    },
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['chat-messages', projectId] });
      const previousMessages = queryClient.getQueryData(['chat-messages', projectId]);

      queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          messages: old.messages.filter((msg: ChatMessage) => msg.id !== messageId)
        };
      });

      return { previousMessages };
    },
    onError: (error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', projectId], context.previousMessages);
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Message deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      });
    },
  });

  return {
    sendMessage: async (content: string, replyTo?: string) => {
      await sendMessageMutation.mutateAsync({ content, replyTo: replyTo || undefined });
    },
    updateMessage: async (messageId: string, content: string) => {
      await updateMessageMutation.mutateAsync({ messageId, content });
    },
    deleteMessage: async (messageId: string) => {
      await deleteMessageMutation.mutateAsync(messageId);
    },
    isSending: sendMessageMutation.isPending,
    isUpdating: updateMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
  };
} 