"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card'; // For empty state
import { FileText } from 'lucide-react'; // For empty state icon
import { TaskCard } from '../TaskCard/TaskCard';
import { CreateTaskForm } from '../../../project/CreateTaskForm'; // Corrected path
import type { Project, Member, Task, SubTask } from '../../../types'; // Adjusted path

// ----- Type Definitions are now imported from ../../../types -----

interface TasksViewLeaderProps {
  projectId: string;
  project: Project; // Full project object
  tasks: Task[]; // Filtered and sorted list of tasks
  // members: Member[]; // Already in project.members, not needed separately unless CreateTaskForm is invoked here
  onTaskCreated: (newTask: Task) => void; // For CreateTaskForm in empty state
  onTaskUpdated: (updatedTask: Partial<Task> & { id: string }) => void;
  onTaskDeleted: (taskId: string) => void;
  onSubTaskUpdated: (taskId: string, updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskCreated: (taskId: string, newSubTask: SubTask) => void;
  onSubTaskDeleted: (taskId: string, subtaskId: string) => void;
  canCreateTasks: boolean; // To conditionally show CreateTaskForm in empty state
  rawTasksCount: number; // Total number of tasks before filtering
}

export const TasksViewLeader: React.FC<TasksViewLeaderProps> = ({
  projectId,
  project,
  tasks,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onSubTaskUpdated,
  onSubTaskCreated,
  onSubTaskDeleted,
  canCreateTasks,
  rawTasksCount,
}) => {
  if (tasks.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {rawTasksCount === 0 ? 'No tasks found' : 'No tasks match your filters'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {rawTasksCount === 0
              ? 'No tasks have been created for this project yet.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {canCreateTasks && rawTasksCount === 0 && (
            <CreateTaskForm
              projectId={projectId}
              onTaskCreated={onTaskCreated}
              members={project.members}
              projectData={project} // CreateTaskForm might expect this prop
            />
          )}
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
