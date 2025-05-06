// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// Project member role types
export type MemberRole = 'leader' | 'member' | 'viewer';

// Project member types
export interface ProjectMember {
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string;
  createdAt: string;
  leader: string;
  members: ProjectMember[];
}

// Task importance types
export type TaskImportance = 'minor' | 'normal' | 'major' | 'critical';

// Task status types
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Item type discriminator
export type ItemType = 'task' | 'event';

// Base item interface for shared properties
export interface BaseItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  createdAt: string;
  type: ItemType;
}

// Task types
export interface Task extends BaseItem {
  assignedTo: string | string[];
  importance: TaskImportance;
  status: TaskStatus;
  deadline: string;
  note?: string;
  type: 'task';
  startDate?: string; // Optional for backward compatibility
}

// Event types
export interface Event extends BaseItem {
  date: string; // Single date with time
  time: string; // Time of the event
  location?: string;
  type: 'event';
}

// Resource types
export interface Resource {
  id: string;
  projectId: string;
  name: string;
  type: string;
  url: string;
  createdBy: string;
  createdAt: string;
}
