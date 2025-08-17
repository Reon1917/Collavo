"use client";

import { Calendar } from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { Task } from '@/hooks/shared/useProjectData';

interface CompactTaskCardProps {
  task: Task;
}

export function CompactTaskCard({ task }: CompactTaskCardProps) {
  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-muted0';
    }
  };

  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  const totalSubTasks = task.subTasks.length;
  const progress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

  return (
    <div className="bg-background dark:bg-card/50 border border-gray-100 dark:border-border rounded-lg p-3 hover:shadow-sm hover:border-border dark:hover:border-border transition-all h-full flex flex-col">
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getImportanceColor(task.importanceLevel)}`} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground dark:text-foreground line-clamp-2 leading-tight mb-1">
            {task.title}
          </h3>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            {task.creatorName}
          </p>
        </div>
      </div>

      {totalSubTasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            <span>{completedSubTasks}/{totalSubTasks}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {totalSubTasks > 0 && (
        <div className="flex-1 space-y-1">
          {task.subTasks.slice(0, 3).map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-1.5 text-xs">
              <div className={`w-1 h-1 rounded-full flex-shrink-0 ${
                subtask.status === 'completed' ? 'bg-green-500' :
                subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <span className="text-muted-foreground dark:text-muted-foreground truncate flex-1 text-xs">
                {subtask.title}
              </span>
            </div>
          ))}
          {totalSubTasks > 3 && (
            <p className="text-xs text-muted-foreground dark:text-muted-foreground text-center">
              +{totalSubTasks - 3}
            </p>
          )}
        </div>
      )}

      {task.deadline && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-border">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className={`${isAfter(new Date(), new Date(task.deadline)) ? 'text-red-500' : 'text-muted-foreground dark:text-muted-foreground'}`}>
              {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 