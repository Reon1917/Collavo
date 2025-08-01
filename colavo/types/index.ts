/**
 * Core Type Definitions for Collavo Project Management System
 * 
 * This file contains all the shared types and interfaces used throughout the application.
 * All types are designed to be strict and secure by default.
 */

// ========================================================================================
// Authentication & User Types
// ========================================================================================

/** User authentication and profile data */
export interface User {
  readonly id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

/** User data that can be safely exposed to client-side */
export interface PublicUser {
  readonly id: string;
  name: string;
  email: string;
  image?: string | null;
}

/** Form data for user registration */
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Form data for user login */
export interface LoginFormData {
  email: string;
  password: string;
}

// ========================================================================================
// Project & Team Management Types
// ========================================================================================

/** Project member role with strict hierarchy */
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

/** Project member with enhanced metadata */
export interface ProjectMember {
  readonly userId: string;
  readonly projectId: string;
  role: MemberRole;
  readonly joinedAt: Date;
  readonly invitedBy: string;
  isActive: boolean;
}

/** Project status for lifecycle management */
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';

/** Project priority levels */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

/** Complete project definition with enhanced metadata */
export interface Project {
  readonly id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  readonly ownerId: string;
  deadline?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  members: ProjectMember[];
  isArchived: boolean;
  tags: string[];
}

/** Data for creating a new project */
export interface CreateProjectData {
  name: string;
  description: string;
  priority: ProjectPriority;
  deadline?: Date | null;
  tags?: string[];
}

/** Data for updating an existing project */
export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  deadline?: Date | null;
  tags?: string[];
}

// ========================================================================================
// Task Management Types
// ========================================================================================

/** Task importance levels with clear hierarchy */
export type TaskImportance = 'low' | 'normal' | 'high' | 'critical';

/** Task status for workflow management */
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';

/** Task with comprehensive metadata */
export interface Task {
  readonly id: string;
  readonly projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  importance: TaskImportance;
  readonly createdBy: string;
  assignedTo: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags: string[];
  dependencies: string[]; // Task IDs this task depends on
  notes: string;
}

/** Data for creating a new task */
export interface CreateTaskData {
  title: string;
  description: string;
  importance: TaskImportance;
  assignedTo?: string[];
  startDate?: Date | null;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  tags?: string[];
  dependencies?: string[];
  notes?: string;
}

/** Data for updating an existing task */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  importance?: TaskImportance;
  assignedTo?: string[];
  startDate?: Date | null;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags?: string[];
  dependencies?: string[];
  notes?: string;
}

// ========================================================================================
// Event & Calendar Types
// ========================================================================================

/** Event types for categorization */
export type EventType = 'meeting' | 'deadline' | 'milestone' | 'reminder' | 'other';

/** Calendar event with enhanced details */
export interface Event {
  readonly id: string;
  readonly projectId: string;
  title: string;
  description: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string | null;
  attendees: string[]; // User IDs
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  tags: string[];
  isRecurring: boolean;
  recurrenceRule?: string | null; // RFC 5545 RRULE format
}

/** Data for creating a new event */
export interface CreateEventData {
  title: string;
  description: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  isAllDay?: boolean;
  location?: string | null;
  attendees?: string[];
  tags?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string | null;
}

// ========================================================================================
// File & Resource Management Types
// ========================================================================================

/** Allowed file types for security */
export type AllowedFileType = 
  | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  | 'application/pdf' | 'text/plain' | 'text/csv'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

/** File resource with security metadata */
export interface FileResource {
  readonly id: string;
  readonly projectId: string;
  name: string;
  originalName: string;
  fileType: AllowedFileType;
  fileSize: number; // in bytes
  url: string;
  readonly uploadedBy: string;
  readonly uploadedAt: Date;
  readonly updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  checksum: string; // For integrity verification
}

// ========================================================================================
// Chat & Messaging Types
// ========================================================================================

/** Chat message types */
export type ChatMessageType = 'text' | 'system' | 'file';

/** Chat message with full metadata */
export interface ChatMessage {
  readonly id: string;
  readonly projectId: string;
  readonly userId: string;
  content: string;
  messageType: ChatMessageType;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  replyTo?: string | null;
  isEdited: boolean;
  editedAt?: Date | null;
  
  // Populated fields from joins
  user?: {
    id: string;
    name: string;
    image?: string | null;
  };
  parentMessage?: Pick<ChatMessage, 'id' | 'content' | 'userId' | 'user'>;
}

/** Data for creating a new chat message */
export interface CreateChatMessageData {
  content: string;
  messageType?: ChatMessageType;
  replyTo?: string | null;
}

/** Data for updating an existing chat message */
export interface UpdateChatMessageData {
  content: string;
}

/** User presence information */
export interface UserPresence {
  readonly id: string;
  readonly userId: string;
  readonly projectId: string;
  lastSeen: Date;
  isOnline: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  
  // Populated fields from joins
  user?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

/** Online members for a project */
export interface OnlineMembers {
  readonly projectId: string;
  members: UserPresence[];
  count: number;
}

/** Chat state for React components */
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  hasMore: boolean;
  error?: string | null;
  onlineMembers: UserPresence[];
  isTyping: string[]; // User IDs who are currently typing
}

/** Typing indicator data */
export interface TypingIndicator {
  readonly userId: string;
  readonly projectId: string;
  readonly userName: string;
  readonly timestamp: Date;
}

/** Chat events for real-time subscriptions */
export type ChatEvent = 
  | { type: 'message_added'; payload: ChatMessage }
  | { type: 'message_updated'; payload: ChatMessage }
  | { type: 'message_deleted'; payload: { id: string; projectId: string } }
  | { type: 'user_joined'; payload: UserPresence }
  | { type: 'user_left'; payload: UserPresence }
  | { type: 'typing_start'; payload: TypingIndicator }
  | { type: 'typing_stop'; payload: TypingIndicator };

/** Message pagination options */
export interface MessagePaginationOptions {
  limit?: number;
  before?: string; // Message ID to fetch messages before
  after?: string; // Message ID to fetch messages after
}

/** Chat hook return type */
export interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (content: string, replyTo?: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  onlineMembers: UserPresence[];
  isLoading: boolean;
  isConnected: boolean;
  hasMore: boolean;
  error?: string | null;
  startTyping: () => void;
  stopTyping: () => void;
  isTyping: string[];
}

// ========================================================================================
// API Response Types
// ========================================================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

/** API error response */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  field?: string;
  details?: Record<string, unknown>;
}

// ========================================================================================
// Form & Validation Types
// ========================================================================================

/** Generic form field error */
export interface FieldError {
  field: string;
  message: string;
}

/** Form validation result */
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
}

/** Form state for complex forms */
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// ========================================================================================
// Database Schema Types (for Drizzle ORM)
// ========================================================================================

/** Database user record */
export interface DbUser {
  readonly id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Database project record */
export interface DbProject {
  readonly id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  readonly ownerId: string;
  deadline?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  isArchived: boolean;
  tags: string[];
}

// ========================================================================================
// Utility Types
// ========================================================================================

/** Make all properties of T optional except for K */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/** Extract keys from T that are of type U */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/** Deep readonly type */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** Result type for operations that can fail */
export type Result<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ========================================================================================
// Constants & Enums
// ========================================================================================

/** Maximum file size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum number of project members */
export const MAX_PROJECT_MEMBERS = 50;

/** Maximum number of tags per item */
export const MAX_TAGS_PER_ITEM = 10;

/** Pagination limits */
export const PAGINATION = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 20,
} as const;
