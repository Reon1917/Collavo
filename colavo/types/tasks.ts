// Task-specific types for component usage

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

export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';
export type SubTaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskStatusFilter = 'all' | 'no_subtasks' | 'pending' | 'in_progress' | 'completed';
export type SortOption = 'created' | 'title' | 'importance' | 'deadline' | 'progress'; 