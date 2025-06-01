"use client";

import React, { useState } from 'react'; // Added React import
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SubTaskDetailsDialog } from '../../../SubTaskDetailsDialog/SubTaskDetailsDialog'; // Updated path
import type { Project, Member, Task, SubTask } from '../../../types'; // Adjusted path

// Interfaces are now imported from ../../../types

interface SubTaskItemProps {
  subtask: SubTask;
  task: Task; // Provides context like mainTaskDeadline
  project: Project; // Provides context like currentUserId, isLeader, members, projectDeadline
  onSubTaskUpdated: (updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskDeleted: (subtaskId: string) => void;
}

export const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subtask,
  task,
  project,
  onSubTaskUpdated,
  onSubTaskDeleted
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canUpdateSubtask = subtask.assignedId === project.currentUserId ||
                          project.isLeader ||
                          project.userPermissions.includes('updateTask'); // Assuming 'updateTask' also applies to subtasks

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleSubTaskUpdatedCallback = (updatedSubTask: Partial<SubTask> & { id: string }) => {
    onSubTaskUpdated(updatedSubTask);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div
        className="flex items-start justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 min-h-[80px]"
        onClick={handleOpenDialog}
      >
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 pr-2">
              {subtask.title}
            </p>
            <Badge
              variant="secondary"
              className={`text-xs flex-shrink-0 ${getStatusColor(subtask.status)}`}
            >
              {subtask.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {subtask.assignedUserName && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {subtask.assignedUserName === project.currentUserId ? 'You' : subtask.assignedUserName}
                  </span>
                </div>
              )}
              {subtask.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    Due {formatDistanceToNow(new Date(subtask.deadline), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {canUpdateSubtask && ( // Displaying this badge might be optional
              <Badge variant="outline" className="text-xs">
                Can Edit
              </Badge>
            )}
          </div>

          {subtask.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {subtask.description}
            </p>
          )}
        </div>
      </div>

      <SubTaskDetailsDialog
        subTask={subtask}
        currentUserId={project.currentUserId}
        isProjectLeader={project.isLeader}
        projectId={project.id}
        mainTaskId={task.id} // Pass main task ID
        mainTaskDeadline={task.deadline} // Pass main task deadline from task prop
        projectDeadline={project.deadline} // Pass project deadline from project prop
        members={project.members}
        onSubTaskUpdated={handleSubTaskUpdatedCallback}
        onSubTaskDeleted={onSubTaskDeleted} // Pass the original callback directly
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};
