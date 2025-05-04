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

// Task types
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string[];
  importance: TaskImportance;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
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
