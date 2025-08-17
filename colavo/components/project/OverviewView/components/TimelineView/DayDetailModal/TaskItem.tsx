"use client";

import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    status: string;
    importance: 'low' | 'normal' | 'high' | 'critical';
    dueDate?: Date | null;
    assignedTo?: string[];
  };
}

export function TaskItem({ task }: TaskItemProps) {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-muted text-foreground';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="p-3 border border-border dark:border-border rounded-lg bg-background dark:bg-muted/50 hover:shadow-sm transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground dark:text-foreground text-sm">{task.title}</h4>
        <div className="flex gap-1">
          <Badge className={getImportanceColor(task.importance)} variant="secondary">
            {task.importance}
          </Badge>
          <Badge className={getStatusColor(task.status)} variant="secondary">
            {task.status}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground dark:text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Due {task.dueDate.toLocaleDateString()}</span>
          </div>
        )}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{task.assignedTo.length} assigned</span>
          </div>
        )}
      </div>
    </div>
  );
} 