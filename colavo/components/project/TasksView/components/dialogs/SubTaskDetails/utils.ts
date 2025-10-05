export const getStatusColor = (status: string, isOverdue = false) => {
  if (isOverdue && status !== 'completed') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
  }

  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
};

export const getStatusLabel = (status: string, isOverdue = false) => {
  if (isOverdue && status !== 'completed') {
    return 'Overdue';
  }

  switch (status) {
    case 'completed': return 'Completed';
    case 'in_progress': return 'In Progress';
    default: return 'Pending';
  }
};

export const getMaxDate = (mainTaskDeadline: string | null, projectDeadline: string | null) => {
  const dates = [mainTaskDeadline, projectDeadline].filter(Boolean).map(d => new Date(d!));
  if (dates.length === 0) return undefined;
  return new Date(Math.min(...dates.map(d => d.getTime())));
};

export const validateDeadline = (
  deadline: Date,
  mainTaskDeadline: string | null,
  projectDeadline: string | null
): string | null => {
  if (mainTaskDeadline && deadline > new Date(mainTaskDeadline)) {
    return 'Subtask deadline cannot be later than the main task deadline';
  }
  
  if (projectDeadline && deadline > new Date(projectDeadline)) {
    return 'Subtask deadline cannot be later than the project deadline';
  }
  
  return null;
}; 