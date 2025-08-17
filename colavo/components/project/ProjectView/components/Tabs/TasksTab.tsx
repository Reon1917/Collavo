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
        <h2 className="text-2xl font-bold text-foreground dark:text-foreground">Project Tasks</h2>
        {canCreateTasks && (
          <CreateTaskForm 
            projectId={projectId} 
            onTaskCreated={onRefresh}
            members={members}
            trigger={
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-[#006666] text-foreground rounded-md font-medium transition-colors cursor-pointer">
                <Plus className="h-4 w-4" />
                Create Task
              </div>
            }
          />
        )}
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-background dark:bg-card/50 border border-gray-100 dark:border-border rounded-lg">
          <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">No tasks yet</h3>
          <p className="text-muted-foreground dark:text-muted-foreground mb-4">
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
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-[#006666] text-foreground rounded-md font-medium transition-colors cursor-pointer">
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