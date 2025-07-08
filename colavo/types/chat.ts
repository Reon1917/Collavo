/**
 * Enhanced Chat System Types
 * 
 * This file contains enhanced and extended types for the refactored chat system.
 * These types extend the base chat types in types/index.ts with additional
 * functionality and better separation of concerns.
 */

import { 
  ChatMessage as BaseChatMessage, 
  UserPresence as BaseUserPresence, 
  CreateChatMessageData as BaseCreateChatMessageData,
  UpdateChatMessageData,
  TypingIndicator as BaseTypingIndicator,
  ChatMessageType 
} from './index';

// ========================================================================================
// Enhanced Chat Message Types
// ========================================================================================

/** Enhanced chat message interface with better typing and utility fields */
export interface ChatMessage extends BaseChatMessage {
  // Enhanced user information
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  
  // Enhanced parent message for replies
  parentMessage?: {
    id: string;
    content: string;
    userId: string;
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
  };
  
  // Additional utility fields
  isFromCurrentUser?: boolean;
  isOptimistic?: boolean; // For optimistic updates
  tempId?: string; // For temporary messages during sending
}

/** Enhanced create message data with better validation */
export interface CreateChatMessageData extends BaseCreateChatMessageData {
  content: string;
  messageType?: ChatMessageType;
  replyTo?: string | null;
  
  // Additional fields for enhanced functionality
  mentions?: string[]; // User IDs mentioned in the message
  attachments?: string[]; // File IDs attached to the message
}

/** Message update data */
export interface UpdateChatMessageData {
  content: string;
  mentions?: string[]; // Updated mentions
}

// ========================================================================================
// Enhanced User Presence Types
// ========================================================================================

/** Enhanced user presence with additional status information */
export interface UserPresence extends BaseUserPresence {
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  
  // Enhanced presence fields
  status?: 'online' | 'away' | 'busy' | 'offline';
  lastActiveAt?: Date;
  currentDevice?: 'desktop' | 'mobile' | 'tablet';
}

/** Presence update data */
export interface PresenceUpdateData {
  isOnline: boolean;
  status?: 'online' | 'away' | 'busy';
  lastActiveAt?: Date;
  currentDevice?: 'desktop' | 'mobile' | 'tablet';
}

// ========================================================================================
// Enhanced Typing Indicator Types
// ========================================================================================

/** Enhanced typing indicator with better timestamp handling */
export interface TypingIndicator extends BaseTypingIndicator {
  isTyping: boolean;
  startedAt: Date;
  expiresAt: Date;
}

/** Typing event payload for real-time subscriptions */
export interface TypingEventPayload {
  userId: string;
  userName: string;
  projectId: string;
  timestamp: string;
  action: 'start' | 'stop';
}

// ========================================================================================
// Chat Room & Channel Types
// ========================================================================================

/** Chat room/channel information */
export interface ChatRoom {
  id: string;
  name: string;
  projectId: string;
  type: 'project' | 'direct' | 'group';
  
  // Room metadata
  lastMessage?: ChatMessage;
  unreadCount: number;
  lastReadMessageId?: string;
  
  // Room settings
  isArchived: boolean;
  isMuted: boolean;
  notifications: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/** Chat room member information */
export interface ChatRoomMember {
  userId: string;
  roomId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastSeenAt: Date;
  permissions: {
    canSendMessages: boolean;
    canEditMessages: boolean;
    canDeleteMessages: boolean;
    canManageMembers: boolean;
  };
}

// ========================================================================================
// Real-time Subscription Types
// ========================================================================================

/** Subscription status for real-time connections */
export type SubscriptionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Real-time event types */
export type RealTimeEventType = 
  | 'message_inserted'
  | 'message_updated' 
  | 'message_deleted'
  | 'presence_updated'
  | 'presence_joined'
  | 'presence_left'
  | 'typing_start'
  | 'typing_stop'
  | 'room_updated';

/** Real-time event payload */
export interface RealTimeEvent<T = unknown> {
  type: RealTimeEventType;
  payload: T;
  timestamp: string;
  userId?: string;
  projectId: string;
}

/** Subscription configuration */
export interface SubscriptionConfig {
  projectId: string;
  userId: string;
  events: RealTimeEventType[];
  onEvent: (event: RealTimeEvent) => void;
  onStatusChange: (status: SubscriptionStatus) => void;
  onError: (error: Error) => void;
}

// ========================================================================================
// Hook Return Types
// ========================================================================================

/** Enhanced chat messages hook return type */
export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  loadMoreMessages: () => Promise<void>;
  refetchMessages: () => void;
  
  // Utility functions
  getMessageById: (id: string) => ChatMessage | undefined;
  getMessagesByUser: (userId: string) => ChatMessage[];
  getUnreadCount: () => number;
}

/** Chat mutations hook return type */
export interface UseChatMutationsReturn {
  // Message operations
  sendMessage: (content: string, replyTo?: string) => Promise<ChatMessage>;
  updateMessage: (messageId: string, content: string) => Promise<ChatMessage>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Operation states
  isSending: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Optimistic updates
  addOptimisticMessage: (message: Partial<ChatMessage>) => void;
  removeOptimisticMessage: (tempId: string) => void;
}

/** Presence hook return type */
export interface UsePresenceReturn {
  onlineMembers: UserPresence[];
  isOnline: boolean;
  currentUserPresence: UserPresence | null;
  
  // Actions
  updatePresence: (isOnline: boolean, status?: 'online' | 'away' | 'busy') => Promise<void>;
  setStatus: (status: 'online' | 'away' | 'busy') => Promise<void>;
  
  // Utility functions
  isUserOnline: (userId: string) => boolean;
  getUserPresence: (userId: string) => UserPresence | undefined;
  getOnlineCount: () => number;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

/** Typing indicator hook return type */
export interface UseTypingIndicatorReturn {
  // Current typing state
  isTyping: string[]; // User IDs currently typing
  typingUsers: UserPresence[]; // Full user objects of typing users
  
  // Actions
  startTyping: () => void;
  stopTyping: () => void;
  
  // Utility functions
  isUserTyping: (userId: string) => boolean;
  getTypingText: () => string; // "John is typing..." or "John and Jane are typing..."
}

/** Real-time subscriptions hook return type */
export interface UseRealTimeSubscriptionsReturn {
  // Connection state
  isConnected: boolean;
  connectionStatus: SubscriptionStatus;
  lastConnectedAt: Date | null;
  
  // Channels
  messageChannel: any;
  presenceChannel: any;
  
  // Connection management
  reconnect: () => void;
  disconnect: () => void;
  
  // Error handling
  error: string | null;
  retryCount: number;
}

/** Main project chat hook return type */
export interface UseProjectChatReturn {
  // Messages
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  loadMoreMessages: () => Promise<void>;
  
  // Mutations
  sendMessage: (content: string, replyTo?: string) => Promise<ChatMessage>;
  updateMessage: (messageId: string, content: string) => Promise<ChatMessage>;
  deleteMessage: (messageId: string) => Promise<void>;
  isSending: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Presence
  onlineMembers: UserPresence[];
  isOnline: boolean;
  currentUserPresence: UserPresence | null;
  
  // Typing
  startTyping: () => void;
  stopTyping: () => void;
  isTyping: string[];
  typingUsers: UserPresence[];
  
  // Connection
  isConnected: boolean;
  connectionStatus: SubscriptionStatus;
  
  // Utility functions
  isUserOnline: (userId: string) => boolean;
  isUserTyping: (userId: string) => boolean;
  getMessageById: (id: string) => ChatMessage | undefined;
  getUnreadCount: () => number;
  
  // Error handling
  error: string | null;
  retryCount: number;
  reconnect: () => void;
}

// ========================================================================================
// Configuration Types
// ========================================================================================

/** Chat hook configuration options */
export interface ChatHookOptions {
  enabled?: boolean;
  pageSize?: number;
  staleTime?: number;
  gcTime?: number;
  maxRetries?: number;
  retryDelay?: number;
  enableOptimisticUpdates?: boolean;
  enableTypingIndicators?: boolean;
  enablePresenceTracking?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

/** Message cache configuration */
export interface MessageCacheConfig {
  maxMessages?: number;
  ttl?: number; // Time to live in milliseconds
  persistToStorage?: boolean;
  compressionEnabled?: boolean;
}

/** Presence tracking configuration */
export interface PresenceConfig {
  heartbeatInterval?: number;
  offlineTimeout?: number;
  statusUpdateThrottle?: number;
  trackLastSeen?: boolean;
}

/** Typing indicator configuration */
export interface TypingConfig {
  typingTimeout?: number;
  debounceDelay?: number;
  maxTypingUsers?: number;
  showTypingIndicator?: boolean;
}

// ========================================================================================
// Utility & Helper Types
// ========================================================================================

/** Message grouping options */
export interface MessageGrouping {
  groupByDate?: boolean;
  groupByUser?: boolean;
  timeThreshold?: number; // Minutes between messages to group
  maxGroupSize?: number;
}

/** Message formatting options */
export interface MessageFormatting {
  parseMarkdown?: boolean;
  parseEmoji?: boolean;
  parseMentions?: boolean;
  parseLinks?: boolean;
  maxContentLength?: number;
}

/** Chat analytics data */
export interface ChatAnalytics {
  messageCount: number;
  activeUsers: number;
  avgResponseTime: number;
  peakUsageTime: Date;
  mostActiveUser: string;
  popularKeywords: string[];
}

/** Error types for chat operations */
export type ChatErrorType = 
  | 'connection_error'
  | 'permission_denied'
  | 'message_too_long'
  | 'user_not_found'
  | 'project_not_found'
  | 'rate_limit_exceeded'
  | 'server_error'
  | 'network_error'
  | 'validation_error';

/** Chat error with enhanced information */
export interface ChatError {
  type: ChatErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  projectId?: string;
  retryable: boolean;
}

// ========================================================================================
// Export All Types
// ========================================================================================

// Re-export base types for convenience
export type {
  ChatMessageType,
  UpdateChatMessageData as BaseChatMessageUpdateData,
  User,
  PublicUser
} from './index';

// Export constants
export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_TYPING_USERS: 5,
  TYPING_TIMEOUT: 3000,
  PRESENCE_HEARTBEAT: 15000,
  RECONNECT_INTERVAL: 5000,
  MAX_RETRIES: 3,
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;

// Export type guards
export function isChatMessage(obj: unknown): obj is ChatMessage {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'content' in obj;
}

export function isUserPresence(obj: unknown): obj is UserPresence {
  return typeof obj === 'object' && obj !== null && 'userId' in obj && 'isOnline' in obj;
}

export function isTypingIndicator(obj: unknown): obj is TypingIndicator {
  return typeof obj === 'object' && obj !== null && 'userId' in obj && 'isTyping' in obj;
}

export function isChatError(obj: unknown): obj is ChatError {
  return typeof obj === 'object' && obj !== null && 'type' in obj && 'message' in obj;
}