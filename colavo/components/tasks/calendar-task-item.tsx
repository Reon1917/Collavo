"use client";

import { Task } from "@/types";

interface CalendarTaskItemProps {
  task: Task;
}

export function CalendarTaskItem({ task }: CalendarTaskItemProps) {
  // Determine color based on importance
  const importanceColors = {
    'low': 'bg-gray-100 text-gray-800',
    'normal': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  } as const;

  return (
    <div 
      className={`px-2 py-1 rounded text-xs truncate ${importanceColors[task.importance]}`}
      title={task.title}
    >
      {task.title}
    </div>
  );
}
