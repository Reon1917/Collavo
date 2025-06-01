"use client";

import React, { useState } from 'react'; // Added React import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  Plus,
  MoreVertical, // For the dropdown menu trigger
  Edit,     // For Edit Task item in dropdown
  Trash2,   // For Delete Task item in dropdown
  // Loader2 is not directly used by TaskCard itself, but by the confirmation dialog,
  // which is now assumed to be part of EditTaskDialog or a separate ConfirmationDialog component.
  // For now, assuming the delete confirmation is simple or externalized.
} from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns'; // For formatting deadline
import { CreateSubTaskForm } from '../../../project/CreateSubTaskForm'; // Adjusted path
import { EditTaskDialog } from '../../../project/EditTaskDialog';       // Adjusted path
import { SubTaskItem } from '../SubTaskItem/SubTaskItem';      // Corrected relative path
import { toast } from 'sonner'; // For notifications
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // For task actions
import { Progress } from '@/components/ui/progress';
import type { Project, Member, Task, SubTask } from '../../../types'; // Adjusted path

// Interfaces are now imported from ../../../types
// Local minimal definitions for Project & Member specific to TaskCard's needs can be removed if covered by imported types.
// The imported Project and Member types are comprehensive.

interface TaskCardProps {
  task: Task;
  project: Project; // project is needed for permissions, members, deadlines for dialogs
  onTaskUpdated: (updatedTask: Partial<Task> & { id: string }) => void;
  onTaskDeleted: (taskId: string) => void;
  onSubTaskUpdated: (taskId: string, updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskCreated: (taskId: string, newSubTask: SubTask) => void;
  onSubTaskDeleted: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  onTaskUpdated,
  onTaskDeleted,
  onSubTaskUpdated,
  onSubTaskCreated,
  onSubTaskDeleted
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateSubTaskDialog, setShowCreateSubTaskDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  const visibleSubTasks = task.subTasks.filter(subtask => {
    if (project.isLeader || project.userPermissions.includes('viewFiles')) {
      return true;
    }
    return subtask.assignedId === project.currentUserId;
  });

  const totalSubTasks = visibleSubTasks.length;
  const completedSubTasks = visibleSubTasks.filter(st => st.status === 'completed').length;
  const progress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

  const handleEditTask = () => {
    setShowEditDialog(true);
  };

  const handleCreateSubTask = () => {
    setShowCreateSubTaskDialog(true);
  };

  const handleDeleteTask = async () => {
    setShowDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Task deleted successfully');
        onTaskDeleted(task.id);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete task');
      }
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setShowDeleteConfirmDialog(false);
    }
  };

  const handleTaskUpdatedCallback = (updatedTask: Partial<Task> & { id: string }) => {
    onTaskUpdated(updatedTask);
  };

  const canModifyTask = project.isLeader || project.userPermissions.includes('updateTask') || task.createdBy === project.currentUserId;
  const canCreateSubtasks = project.isLeader || project.userPermissions.includes('createTask');
  const canViewAllTasks = project.isLeader || project.userPermissions.includes('viewFiles'); // To show "Your Tasks Only" badge

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium border ${task.importanceLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800' : task.importanceLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800' : task.importanceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'}`}
                >
                  {task.importanceLevel.charAt(0).toUpperCase() + task.importanceLevel.slice(1)}
                </Badge>
                {!canViewAllTasks && ( // This logic might need re-evaluation based on where TaskCard is used
                  <Badge variant="secondary" className="text-xs">
                    Your Tasks Only
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                  {task.description}
                </CardDescription>
              )}
            </div>
            {(canModifyTask || canCreateSubtasks) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-8 w-8 p-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canCreateSubtasks && (
                    <DropdownMenuItem onClick={handleCreateSubTask}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subtask
                    </DropdownMenuItem>
                  )}
                  {canModifyTask && (
                    <DropdownMenuItem onClick={handleEditTask}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  )}
                  {canModifyTask && (
                    <DropdownMenuItem
                      onClick={handleDeleteTask}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {visibleSubTasks.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress {!canViewAllTasks && '(Your Tasks)'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {completedSubTasks} of {totalSubTasks} subtasks completed
                {!canViewAllTasks && ' (assigned to you)'}
              </p>
            </div>
          )}

          {visibleSubTasks.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Subtasks {!canViewAllTasks && '(Assigned to You)'}
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {visibleSubTasks.slice(0, 4).map((subtask) => (
                  <SubTaskItem
                    key={subtask.id}
                    subtask={subtask}
                    task={task} // Pass task for context if SubTaskItem needs it (e.g. mainTaskDeadline)
                    project={project} // Pass project for context (members, permissions, deadlines)
                    onSubTaskUpdated={(updatedSubTask) => onSubTaskUpdated(task.id, updatedSubTask)}
                    onSubTaskDeleted={(subtaskId) => onSubTaskDeleted(task.id, subtaskId)}
                  />
                ))}
                {visibleSubTasks.length > 4 && (
                  <div className="text-center py-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      +{visibleSubTasks.length - 4} more subtasks
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {!canViewAllTasks
                  ? 'No subtasks assigned to you in this task'
                  : 'No subtasks created yet'
                }
              </p>
              {canCreateSubtasks && ( // This CreateSubTaskForm might be redundant if dropdown is primary
                <CreateSubTaskForm
                  projectId={project.id}
                  mainTaskId={task.id}
                  mainTaskDeadline={task.deadline}
                  projectDeadline={project.deadline}
                  open={showCreateSubTaskDialog && !visibleSubTasks.length} // Only show if dialog explicitly opened AND no subtasks
                  onOpenChange={setShowCreateSubTaskDialog}
                  onSubTaskCreated={(newSubTask) => onSubTaskCreated(task.id, newSubTask)}
                  members={project.members}
                />
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Created by {task.creatorName}</span>
              </div>
              {task.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span className={isAfter(new Date(), new Date(task.deadline)) ? 'text-red-500' : ''}>
                    Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showEditDialog && canModifyTask && (
        <EditTaskDialog
          task={task}
          projectId={project.id}
          projectDeadline={project.deadline}
          isOpen={showEditDialog}
          onOpenChange={(open) => setShowEditDialog(open)}
          onTaskUpdated={handleTaskUpdatedCallback}
        />
      )}

      <CreateSubTaskForm // This one is for the dropdown menu item
        projectId={project.id}
        mainTaskId={task.id}
        mainTaskDeadline={task.deadline}
        projectDeadline={project.deadline}
        open={showCreateSubTaskDialog} // Controlled by dropdown
        onOpenChange={setShowCreateSubTaskDialog}
        onSubTaskCreated={(newSubTask) => onSubTaskCreated(task.id, newSubTask)}
        members={project.members}
      />

      {showDeleteConfirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-lg">⚠</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Task</h2>
                </div>
                <button
                  onClick={() => setShowDeleteConfirmDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirmDialog(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
