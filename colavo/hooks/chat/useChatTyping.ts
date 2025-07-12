import { useRef, useCallback } from 'react';

interface UseChatTypingOptions {
  projectId: string;
  currentUserId: string;
  enabled?: boolean;
  presenceChannelRef: React.MutableRefObject<any>;
}

interface UseChatTypingReturn {
  startTyping: () => void;
  stopTyping: () => void;
}

export function useChatTyping({ 
  projectId, 
  currentUserId, 
  enabled = true,
  presenceChannelRef 
}: UseChatTypingOptions): UseChatTypingReturn {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!enabled || !currentUserId || !projectId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    presenceChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        userId: currentUserId,
        projectId
      }
    });

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [currentUserId, projectId, enabled, presenceChannelRef]);

  const stopTyping = useCallback(() => {
    if (!enabled || !currentUserId || !projectId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    presenceChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        userId: currentUserId,
        projectId
      }
    });
  }, [currentUserId, projectId, enabled, presenceChannelRef]);

  return {
    startTyping,
    stopTyping,
  };
} 