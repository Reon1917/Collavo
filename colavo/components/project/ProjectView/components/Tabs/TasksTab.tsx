"use client";

import { CheckSquare, Plus } from 'lucide-react';
import { CreateTaskForm } from '@/components/project/TasksView/components/forms/CreateTaskForm';
import { CompactTaskCard } from '../CompactTaskCard';
import { Task, Member } from '@/hooks/shared/useProjectData';

interface TasksTabProps {
  projectId: string;
  tasks: Task[];
  members: Member[];
  canCreateTasks: boolean;
  onRefresh: () => void;
}

export function TasksTab({ projectId, tasks, members, canCreateTasks, onRefresh }: TasksTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Tasks</h2>
        {canCreateTasks && (
          <CreateTaskForm 
            projectId={projectId} 
            onTaskCreated={onRefresh}
            members={members}
            trigger={
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white rounded-md font-medium transition-colors cursor-pointer">
                <Plus className="h-4 w-4" />
                Create Task
              </div>
            }
          />
        )}
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {canCreateTasks 
              ? "Get started by creating your first task."
              : "Tasks will appear here once they're created."
            }
          </p>
          {canCreateTasks && (
            <CreateTaskForm 
              projectId={projectId} 
              onTaskCreated={onRefresh}
              members={members}
              trigger={
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white rounded-md font-medium transition-colors cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Create Task
                </div>
              }
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {tasks.map((task) => (
            <CompactTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
} 