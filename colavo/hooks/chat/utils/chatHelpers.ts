/**
 * Chat System Helper Functions
 * 
 * This file contains utility functions for the chat system including
 * logging, message formatting, grouping, and other helper functions.
 */

import { ChatMessage, UserPresence, TypingIndicator, MessageGrouping } from '@/types/chat';
import { CHAT_CONSTANTS } from '@/types/chat';

// ========================================================================================
// Environment & Logging Utilities
// ========================================================================================

/** Check if we're in development mode */
export const isDev = process.env.NODE_ENV === 'development';

/** Enhanced logging with prefixes and optional data */
export function logChat(message: string, data?: unknown): void {
  if (isDev) {
    if (data) {
      console.log(`[Chat] ${message}`, data);
    } else {
      console.log(`[Chat] ${message}`);
    }
  }
}

export function logPresence(message: string, data?: unknown): void {
  if (isDev) {
    if (data) {
      console.log(`[Presence] ${message}`, data);
    } else {
      console.log(`[Presence] ${message}`);
    }
  }
}

export function logRealTime(message: string, data?: unknown): void {
  if (isDev) {
    if (data) {
      console.log(`[RealTime] ${message}`, data);
    } else {
      console.log(`[RealTime] ${message}`);
    }
  }
}

export function logTyping(message: string, data?: unknown): void {
  if (isDev) {
    if (data) {
      console.log(`[Typing] ${message}`, data);
    } else {
      console.log(`[Typing] ${message}`);
    }
  }
}

export function logError(message: string, error?: Error | unknown): void {
  if (isDev) {
    if (error) {
      console.error(`[Chat Error] ${message}`, error);
    } else {
      console.error(`[Chat Error] ${message}`);
    }
  }
}

// ========================================================================================
// Message Utilities
// ========================================================================================

/**
 * Determine if a message should show a header (user avatar/name)
 * Based on time gap and different users
 */
export function shouldShowMessageHeader(
  currentMessage: ChatMessage,
  previousMessage?: ChatMessage
): boolean {
  // Always show header for first message
  if (!previousMessage) return true;
  
  // Show header if different users
  if (currentMessage.userId !== previousMessage.userId) return true;
  
  // Show header if more than 5 minutes between messages
  const timeDiff = new Date(currentMessage.createdAt).getTime() - 
                   new Date(previousMessage.createdAt).getTime();
  return timeDiff > 5 * 60 * 1000; // 5 minutes
}

/**
 * Group messages by date for better organization
 */
export function groupMessagesByDate(messages: ChatMessage[]): Record<string, ChatMessage[]> {
  return messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);
}

/**
 * Group messages by user and time proximity
 */
export function groupMessagesByUser(
  messages: ChatMessage[],
  options: MessageGrouping = {}
): ChatMessage[][] {
  const {
    timeThreshold = 5, // minutes
    maxGroupSize = 10
  } = options;

  const groups: ChatMessage[][] = [];
  let currentGroup: ChatMessage[] = [];

  for (const message of messages) {
    const lastMessage = currentGroup[currentGroup.length - 1];
    
    // Start new group if:
    // - First message
    // - Different user
    // - Time gap too large
    // - Group too large
    if (
      !lastMessage ||
      lastMessage.userId !== message.userId ||
      getTimeDifferenceInMinutes(lastMessage.createdAt, message.createdAt) > timeThreshold ||
      currentGroup.length >= maxGroupSize
    ) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Get time difference between two dates in minutes
 */
export function getTimeDifferenceInMinutes(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60);
}

/**
 * Format message timestamp for display
 */
export function formatMessageTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format message timestamp for detailed view
 */
export function formatDetailedMessageTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Truncate message content for previews
 */
export function truncateMessage(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * Generate a temporary ID for optimistic updates
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if a message is a temporary/optimistic message
 */
export function isOptimisticMessage(message: ChatMessage): boolean {
  return message.isOptimistic === true || message.tempId?.startsWith('temp_') === true;
}

// ========================================================================================
// User Presence Utilities
// ========================================================================================

/**
 * Get user's online status text
 */
export function getPresenceStatusText(presence: UserPresence): string {
  if (!presence.isOnline) return 'Offline';
  
  switch (presence.status) {
    case 'online':
      return 'Online';
    case 'away':
      return 'Away';
    case 'busy':
      return 'Busy';
    default:
      return 'Online';
  }
}

/**
 * Get user's last seen text
 */
export function getLastSeenText(presence: UserPresence): string {
  if (presence.isOnline) return 'Online now';
  
  const lastSeen = new Date(presence.lastSeen);
  const now = new Date();
  const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)} minutes ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }
}

/**
 * Sort users by online status and last seen
 */
export function sortUsersByPresence(users: UserPresence[]): UserPresence[] {
  return users.sort((a, b) => {
    // Online users first
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    
    // If both online, sort by status
    if (a.isOnline && b.isOnline) {
      const statusPriority = { online: 3, away: 2, busy: 1 };
      return (statusPriority[b.status || 'online'] || 0) - (statusPriority[a.status || 'online'] || 0);
    }
    
    // If both offline, sort by last seen
    return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
  });
}

// ========================================================================================
// Typing Indicator Utilities
// ========================================================================================

/**
 * Generate typing indicator text
 */
export function getTypingIndicatorText(typingUsers: UserPresence[]): string {
  const count = typingUsers.length;
  
  if (count === 0) return '';
  
  if (count === 1) {
    return `${typingUsers[0].user.name} is typing...`;
  }
  
  if (count === 2) {
    return `${typingUsers[0].user.name} and ${typingUsers[1].user.name} are typing...`;
  }
  
  if (count === 3) {
    return `${typingUsers[0].user.name}, ${typingUsers[1].user.name} and ${typingUsers[2].user.name} are typing...`;
  }
  
  return `${typingUsers[0].user.name} and ${count - 1} others are typing...`;
}

/**
 * Check if typing indicator should be shown
 */
export function shouldShowTypingIndicator(typingUsers: UserPresence[], currentUserId: string): boolean {
  // Don't show if no one is typing
  if (typingUsers.length === 0) return false;
  
  // Don't show if only current user is typing
  if (typingUsers.length === 1 && typingUsers[0].userId === currentUserId) return false;
  
  // Filter out current user and check if others are typing
  const othersTyping = typingUsers.filter(user => user.userId !== currentUserId);
  return othersTyping.length > 0;
}

/**
 * Create typing indicator with expiration
 */
export function createTypingIndicator(
  userId: string,
  userName: string,
  projectId: string,
  timeout: number = CHAT_CONSTANTS.TYPING_TIMEOUT
): TypingIndicator {
  const now = new Date();
  return {
    userId,
    projectId,
    userName,
    timestamp: now,
    isTyping: true,
    startedAt: now,
    expiresAt: new Date(now.getTime() + timeout)
  };
}

/**
 * Check if typing indicator has expired
 */
export function isTypingIndicatorExpired(indicator: TypingIndicator): boolean {
  return new Date() > indicator.expiresAt;
}

// ========================================================================================
// Message Content Utilities
// ========================================================================================

/**
 * Extract mentions from message content
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

/**
 * Replace mentions with formatted text
 */
export function formatMentions(content: string, userMap: Map<string, string>): string {
  return content.replace(/@(\w+)/g, (match, username) => {
    const displayName = userMap.get(username) || username;
    return `@${displayName}`;
  });
}

/**
 * Extract URLs from message content
 */
export function extractUrls(content: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.match(urlRegex) || [];
}

/**
 * Check if message contains only emoji
 */
export function isEmojiOnlyMessage(content: string): boolean {
  const emojiRegex = /^[\p{Emoji}\s]+$/u;
  return emojiRegex.test(content.trim());
}

/**
 * Sanitize message content
 */
export function sanitizeMessageContent(content: string): string {
  // Remove potentially harmful content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// ========================================================================================
// Performance Utilities
// ========================================================================================

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Simple retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = CHAT_CONSTANTS.MAX_RETRIES,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries) {
        const waitTime = delay * Math.pow(2, i); // Exponential backoff
        logError(`Retry attempt ${i + 1} failed, retrying in ${waitTime}ms`, lastError);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError!;
}

// ========================================================================================
// Validation Utilities
// ========================================================================================

/**
 * Validate message content
 */
export function validateMessageContent(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (content.length > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH) {
    return { 
      isValid: false, 
      error: `Message too long (max ${CHAT_CONSTANTS.MAX_MESSAGE_LENGTH} characters)` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate user ID
 */
export function validateUserId(userId: string): boolean {
  return typeof userId === 'string' && userId.length > 0 && !userId.includes(' ');
}

/**
 * Validate project ID
 */
export function validateProjectId(projectId: string): boolean {
  return typeof projectId === 'string' && projectId.length > 0 && !projectId.includes(' ');
}

// ========================================================================================
// Storage Utilities
// ========================================================================================

/**
 * Get chat data from localStorage
 */
export function getChatDataFromStorage(key: string): any {
  try {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logError('Failed to get chat data from storage', error);
    return null;
  }
}

/**
 * Set chat data to localStorage
 */
export function setChatDataToStorage(key: string, data: any): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logError('Failed to set chat data to storage', error);
  }
}

/**
 * Remove chat data from localStorage
 */
export function removeChatDataFromStorage(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  } catch (error) {
    logError('Failed to remove chat data from storage', error);
  }
}

// ========================================================================================
// Export All Utilities
// ========================================================================================

export const chatHelpers = {
  // Logging
  logChat,
  logPresence,
  logRealTime,
  logTyping,
  logError,
  
  // Message utilities
  shouldShowMessageHeader,
  groupMessagesByDate,
  groupMessagesByUser,
  getTimeDifferenceInMinutes,
  formatMessageTime,
  formatDetailedMessageTime,
  truncateMessage,
  generateTempId,
  isOptimisticMessage,
  
  // Presence utilities
  getPresenceStatusText,
  getLastSeenText,
  sortUsersByPresence,
  
  // Typing utilities
  getTypingIndicatorText,
  shouldShowTypingIndicator,
  createTypingIndicator,
  isTypingIndicatorExpired,
  
  // Content utilities
  extractMentions,
  formatMentions,
  extractUrls,
  isEmojiOnlyMessage,
  sanitizeMessageContent,
  
  // Performance utilities
  debounce,
  throttle,
  retry,
  
  // Validation utilities
  validateMessageContent,
  validateUserId,
  validateProjectId,
  
  // Storage utilities
  getChatDataFromStorage,
  setChatDataToStorage,
  removeChatDataFromStorage,
};

export default chatHelpers;