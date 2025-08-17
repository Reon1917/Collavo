"use client";

// Database schema types for tasks
interface Task {
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

interface SubTask {
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

interface CalendarTaskItemProps {
  task: Task;
}

export function CalendarTaskItem({ task }: CalendarTaskItemProps) {
  // Determine color based on importance level from database
  const importanceColors = {
    'low': 'bg-muted text-foreground dark:bg-muted ',
    'medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  } as const;

  return (
    <div 
      className={`px-2 py-1 rounded text-xs truncate ${importanceColors[task.importanceLevel]}`}
      title={`${task.title} - ${task.importanceLevel} importance`}
    >
      {task.title}
    </div>
  );
}
