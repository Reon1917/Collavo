// colavo/components/project/types.ts

import type { LucideIcon } from 'lucide-react'; // For RoleDisplayInfo

export interface Member {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: string; // Assuming this is generally available when Member object is used
  userName: string;
  userEmail: string;
  userImage: string | null;
  permissions?: string[]; // Optional as not all contexts might provide this (e.g., simple member list)
}

export interface SubTask {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  note: string | null;
  deadline: string | null;
  assignedId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  creatorEmail: string;
  subTasks: SubTask[];
  // Optional members array if CreateTaskForm gets members directly via Task prop in some contexts
  // However, it's more common for CreateTaskForm to get members from the Project context.
  // members?: Member[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  createdAt: string; // Assuming this is generally available
  updatedAt: string; // Assuming this is generally available
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  members: Member[];

  // These fields relate to the *current user's perspective* on the project.
  // They are often fetched together with the project details for that user.
  userPermissions: string[];
  isLeader: boolean;
  userRole: 'leader' | 'member' | null; // Role of the current user in this project
  currentUserId: string; // ID of the current viewing user
}

export interface RoleDisplayInfo {
  label: string;
  icon: LucideIcon; // Using LucideIcon type
  className: string;
}

// Specific props for components, if they are complex and reused, could also go here,
// but for now, focusing on the core data entities.
// Example:
// export interface TaskCardProps { /* ... */ }
// However, it's often better to keep component-specific props interfaces within the component file
// unless they are passed through many layers or used by multiple distinct components.
