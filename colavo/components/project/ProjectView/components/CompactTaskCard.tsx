"use client";

import { Calendar } from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { Task } from '@/hooks/shared/useProjectData';
import { ScrollbarStyles } from '@/components/ui/scrollbar-styles';

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
      default: return 'bg-gray-500';
    }
  };

  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  const totalSubTasks = task.subTasks.length;
  const progress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all h-full flex flex-col">
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getImportanceColor(task.importanceLevel)}`} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
            {task.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {task.creatorName}
          </p>
        </div>
      </div>

      {totalSubTasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>{completedSubTasks}/{totalSubTasks}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-[#008080] h-1 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {totalSubTasks > 0 && (
        <div className="flex-1 relative">
          <ScrollbarStyles className="compact-subtask-scroll" />
          <div className="space-y-1 compact-subtask-scroll overflow-y-auto" style={{ maxHeight: '84px' }}>
            {task.subTasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-1.5 text-xs py-1">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  subtask.status === 'completed' ? 'bg-green-500' :
                  subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <span className="text-gray-600 dark:text-gray-400 truncate flex-1 text-xs">
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
          {totalSubTasks > 3 && (
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none flex items-center justify-center">
              <span className="text-xs text-gray-400 bg-white dark:bg-gray-800 px-1.5 rounded text-center" style={{ fontSize: '10px' }}>
                +{totalSubTasks - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {task.deadline && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className={`${isAfter(new Date(), new Date(task.deadline)) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 