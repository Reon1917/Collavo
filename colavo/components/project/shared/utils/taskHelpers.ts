interface SubTask {
  status: 'pending' | 'in_progress' | 'completed';
}

interface Task {
  subTasks: SubTask[];
}

export function getTaskProgress(task: Task): number {
  if (task.subTasks.length === 0) return 0;
  const completedCount = task.subTasks.filter(st => st.status === 'completed').length;
  return (completedCount / task.subTasks.length) * 100;
}

export function getTaskStatus(task: Task): string {
  const totalSubTasks = task.subTasks.length;
  if (totalSubTasks === 0) return 'no_subtasks';
  
  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  const inProgressSubTasks = task.subTasks.filter(st => st.status === 'in_progress').length;
  
  if (completedSubTasks === totalSubTasks) return 'completed';
  if (inProgressSubTasks > 0 || completedSubTasks > 0) return 'in_progress';
  return 'pending';
}

export function getImportanceColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'low':
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    default:
      return 'Pending';
  }
} 