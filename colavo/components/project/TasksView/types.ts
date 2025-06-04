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

export interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  members: Member[];
  userPermissions: string[];
  isLeader: boolean;
  userRole: 'leader' | 'member' | null;
  currentUserId: string;
}

export interface Member {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  userName: string;
  userEmail: string;
  userImage: string | null;
}

export interface TasksViewProps {
  projectId: string;
}

// Request cache to prevent duplicate API calls
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export function getCachedRequest<T>(key: string): T | null {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  requestCache.delete(key);
  return null;
}

export function setCachedRequest<T>(key: string, data: T): void {
  requestCache.set(key, { data, timestamp: Date.now() });
}

export function clearCacheForProject(projectId: string): void {
  requestCache.delete(`tasks-${projectId}`);
  requestCache.delete(`project-${projectId}`);
}

export function getTaskProgress(task: Task): number {
  if (!task.subTasks || task.subTasks.length === 0) return 0;
  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  return Math.round((completedSubTasks / task.subTasks.length) * 100);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

export function getImportanceColor(level: string): string {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    default: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
  }
} 