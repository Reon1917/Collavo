"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card'; // For empty state
import { FileText } from 'lucide-react'; // For empty state icon
import { TaskCard } from '../TaskCard/TaskCard';
// CreateTaskForm might not be directly used by member view's empty state,
// as task creation is usually via a global button if permitted.
// import { CreateTaskForm } from '../CreateTaskForm';
import type { Project, Member, Task, SubTask } from '../../../types'; // Adjusted path

// ----- Type Definitions are now imported from ../../../types -----

interface TasksViewMemberProps {
  projectId: string; // Though not directly used, good for consistency
  project: Project;
  tasks: Task[]; // Filtered and sorted list of tasks relevant to the member
  onTaskUpdated: (updatedTask: Partial<Task> & { id: string }) => void;
  onTaskDeleted: (taskId: string) => void;
  onSubTaskUpdated: (taskId: string, updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskCreated: (taskId: string, newSubTask: SubTask) => void;
  onSubTaskDeleted: (taskId: string, subtaskId: string) => void;
  canViewAllTasks: boolean; // To tailor empty state message
  rawTasksCount: number; // Total number of tasks before filtering for this member
}

export const TasksViewMember: React.FC<TasksViewMemberProps> = ({
  project,
  tasks,
  onTaskUpdated,
  onTaskDeleted,
  onSubTaskUpdated,
  onSubTaskCreated,
  onSubTaskDeleted,
  canViewAllTasks, // Used for empty state message
  rawTasksCount,
}) => {
  if (tasks.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {rawTasksCount === 0 && !canViewAllTasks
              ? 'No tasks assigned to you'
              : rawTasksCount === 0
                ? 'No tasks found'
                : 'No tasks match your filters or assignment'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {rawTasksCount === 0 && !canViewAllTasks
              ? 'Tasks assigned to you will appear here.'
              : rawTasksCount === 0
                ? 'No tasks have been created for this project yet.'
                : 'Try adjusting your search or filter criteria, or check with your project leader.'
            }
          </p>
          {/* Members typically don't have a primary "Create Task" button in their empty view here,
              that's usually a global button if they have permission. */}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          project={project}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
          onSubTaskUpdated={onSubTaskUpdated}
          onSubTaskCreated={onSubTaskCreated}
          onSubTaskDeleted={onSubTaskDeleted}
        />
      ))}
    </div>
  );
};
