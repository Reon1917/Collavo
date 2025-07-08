/**
 * Typing Indicator Hook
 * 
 * This hook manages typing indicators for chat, including sending typing events,
 * tracking who is typing, and providing utilities for displaying typing states.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { UserPresence, UseTypingIndicatorReturn, TypingEventPayload } from '@/types/chat';
import { 
  logTyping, 
  getTypingIndicatorText, 
  shouldShowTypingIndicator, 
  createTypingIndicator,
  isTypingIndicatorExpired,
  CHAT_CONSTANTS
} from '../utils/chatHelpers';

// ========================================================================================
// Hook Configuration
// ========================================================================================

interface UseTypingIndicatorOptions {
  enabled?: boolean;
  typingTimeout?: number;
  debounceDelay?: number;
  maxTypingUsers?: number;
  showCurrentUser?: boolean;
}

// ========================================================================================
// Main Hook Implementation
// ========================================================================================

/**
 * Hook for managing typing indicators with automatic timeout and cleanup
 */
export function useTypingIndicator(
  projectId: string,
  currentUserId: string,
  presenceChannel: any,
  onlineMembers: UserPresence[] = [],
  options: UseTypingIndicatorOptions = {}
): UseTypingIndicatorReturn {
  const {
    enabled = true,
    typingTimeout = CHAT_CONSTANTS.TYPING_TIMEOUT,
    debounceDelay = 500,
    maxTypingUsers = CHAT_CONSTANTS.MAX_TYPING_USERS,
    showCurrentUser = false
  } = options;

  // ========================================================================================
  // State Management
  // ========================================================================================

  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  
  // Refs for managing timeouts and debouncing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingIndicators = useRef<Map<string, { timestamp: Date; expiresAt: Date }>>(new Map());

  // ========================================================================================
  // Typing State Management
  // ========================================================================================

  /**
   * Add a user to the typing list with expiration
   */
  const addTypingUser = useCallback((userId: string, userName: string): void => {
    if (!enabled || userId === currentUserId) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + typingTimeout);
    
    // Store typing indicator with expiration
    typingIndicators.current.set(userId, {
      timestamp: now,
      expiresAt
    });

    setTypingUserIds(prev => {
      if (prev.includes(userId)) return prev;
      
      const newTyping = [...prev, userId];
      
      // Limit to max typing users
      if (newTyping.length > maxTypingUsers) {
        return newTyping.slice(-maxTypingUsers);
      }
      
      logTyping(`User started typing: ${userName} (${userId})`);
      return newTyping;
    });
  }, [enabled, currentUserId, typingTimeout, maxTypingUsers]);

  /**
   * Remove a user from the typing list
   */
  const removeTypingUser = useCallback((userId: string): void => {
    typingIndicators.current.delete(userId);
    
    setTypingUserIds(prev => {
      const filtered = prev.filter(id => id !== userId);
      if (filtered.length !== prev.length) {
        logTyping(`User stopped typing: ${userId}`);
      }
      return filtered;
    });
  }, []);

  /**
   * Clean up expired typing indicators
   */
  const cleanupExpiredTyping = useCallback((): void => {
    const now = new Date();
    const expiredUsers: string[] = [];

    typingIndicators.current.forEach((indicator, userId) => {
      if (now > indicator.expiresAt) {
        expiredUsers.push(userId);
      }
    });

    expiredUsers.forEach(userId => {
      removeTypingUser(userId);
    });

    if (expiredUsers.length > 0) {
      logTyping(`Cleaned up ${expiredUsers.length} expired typing indicators`);
    }
  }, [removeTypingUser]);

  // ========================================================================================
  // Broadcasting Functions
  // ========================================================================================

  /**
   * Send typing start event to other users
   */
  const broadcastTypingStart = useCallback((): void => {
    if (!enabled || !presenceChannel || !projectId || !currentUserId) return;

    try {
      const payload: TypingEventPayload = {
        userId: currentUserId,
        userName: 'Current User', // This would ideally come from user context
        projectId,
        timestamp: new Date().toISOString(),
        action: 'start'
      };

      presenceChannel.send({
        type: 'broadcast',
        event: 'typing_start',
        payload
      });

      logTyping('Broadcasted typing start event');
    } catch (error) {
      logTyping('Failed to broadcast typing start', error);
    }
  }, [enabled, presenceChannel, projectId, currentUserId]);

  /**
   * Send typing stop event to other users
   */
  const broadcastTypingStop = useCallback((): void => {
    if (!enabled || !presenceChannel || !projectId || !currentUserId) return;

    try {
      const payload: TypingEventPayload = {
        userId: currentUserId,
        userName: 'Current User',
        projectId,
        timestamp: new Date().toISOString(),
        action: 'stop'
      };

      presenceChannel.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload
      });

      logTyping('Broadcasted typing stop event');
    } catch (error) {
      logTyping('Failed to broadcast typing stop', error);
    }
  }, [enabled, presenceChannel, projectId, currentUserId]);

  // ========================================================================================
  // Public API Functions
  // ========================================================================================

  /**
   * Start typing indicator for current user
   */
  const startTyping = useCallback((): void => {
    if (!enabled || !currentUserId || !projectId) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Debounce rapid successive calls
    if (startTypingTimeoutRef.current) {
      clearTimeout(startTypingTimeoutRef.current);
    }

    startTypingTimeoutRef.current = setTimeout(() => {
      if (!isCurrentUserTyping) {
        setIsCurrentUserTyping(true);
        broadcastTypingStart();
        logTyping('Current user started typing');
      }

      // Auto-stop typing after timeout
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, typingTimeout);
    }, debounceDelay);
  }, [enabled, currentUserId, projectId, isCurrentUserTyping, broadcastTypingStart, typingTimeout, debounceDelay]);

  /**
   * Stop typing indicator for current user
   */
  const stopTyping = useCallback((): void => {
    if (!enabled || !currentUserId || !projectId) return;

    // Clear all timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    if (startTypingTimeoutRef.current) {
      clearTimeout(startTypingTimeoutRef.current);
      startTypingTimeoutRef.current = null;
    }

    if (isCurrentUserTyping) {
      setIsCurrentUserTyping(false);
      broadcastTypingStop();
      logTyping('Current user stopped typing');
    }
  }, [enabled, currentUserId, projectId, isCurrentUserTyping, broadcastTypingStop]);

  /**
   * Set typing users from external source (e.g., real-time events)
   */
  const setTypingUsers = useCallback((userIds: string[]): void => {
    setTypingUserIds(userIds);
  }, []);

  /**
   * Handle incoming typing events
   */
  const handleTypingEvent = useCallback((payload: TypingEventPayload): void => {
    if (!enabled || payload.userId === currentUserId) return;

    const { userId, userName, action } = payload;

    if (action === 'start') {
      addTypingUser(userId, userName);
    } else if (action === 'stop') {
      removeTypingUser(userId);
    }
  }, [enabled, currentUserId, addTypingUser, removeTypingUser]);

  // ========================================================================================
  // Utility Functions
  // ========================================================================================

  /**
   * Check if a specific user is typing
   */
  const isUserTyping = useCallback((userId: string): boolean => {
    return typingUserIds.includes(userId);
  }, [typingUserIds]);

  /**
   * Get typing indicator text for display
   */
  const getTypingText = useCallback((): string => {
    // Filter out current user if not showing
    const filteredUserIds = showCurrentUser 
      ? typingUserIds 
      : typingUserIds.filter(id => id !== currentUserId);

    // Get user presence objects for typing users
    const typingUsers = filteredUserIds
      .map(userId => onlineMembers.find(member => member.userId === userId))
      .filter((user): user is UserPresence => user !== undefined);

    return getTypingIndicatorText(typingUsers);
  }, [typingUserIds, showCurrentUser, currentUserId, onlineMembers]);

  /**
   * Get list of users currently typing with full presence info
   */
  const getTypingUsers = useCallback((): UserPresence[] => {
    const filteredUserIds = showCurrentUser 
      ? typingUserIds 
      : typingUserIds.filter(id => id !== currentUserId);

    return filteredUserIds
      .map(userId => onlineMembers.find(member => member.userId === userId))
      .filter((user): user is UserPresence => user !== undefined);
  }, [typingUserIds, showCurrentUser, currentUserId, onlineMembers]);

  // ========================================================================================
  // Effects
  // ========================================================================================

  // Cleanup interval effect
  useEffect(() => {
    if (!enabled) return;

    // Start cleanup interval
    cleanupIntervalRef.current = setInterval(() => {
      cleanupExpiredTyping();
    }, 1000); // Check every second

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [enabled, cleanupExpiredTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTyping();
      
      // Clear all timeouts
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (startTypingTimeoutRef.current) clearTimeout(startTypingTimeoutRef.current);
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current);
    };
  }, [stopTyping]);

  // ========================================================================================
  // Return Hook Interface
  // ========================================================================================

  return {
    // Current typing state
    isTyping: typingUserIds,
    typingUsers: getTypingUsers(),
    
    // Actions
    startTyping,
    stopTyping,
    
    // Event handling
    handleTypingEvent,
    setTypingUsers,
    
    // Utility functions
    isUserTyping,
    getTypingText,
    
    // Current user state
    isCurrentUserTyping,
  };
}

// ========================================================================================
// Hook Variants
// ========================================================================================

/**
 * Simple typing indicator hook without real-time features
 */
export function useSimpleTypingIndicator(
  options: UseTypingIndicatorOptions = {}
) {
  const {
    typingTimeout = CHAT_CONSTANTS.TYPING_TIMEOUT,
    debounceDelay = 500
  } = options;

  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setIsTyping(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, typingTimeout);
    }, debounceDelay);
  }, [typingTimeout, debounceDelay]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  return {
    isTyping,
    startTyping,
    stopTyping
  };
}

// ========================================================================================
// Export Hook and Utilities
// ========================================================================================

export default useTypingIndicator;