"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  User, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { EditTaskDialog } from '../../../EditTaskDialog';
import { CreateSubTaskForm } from '../../../CreateSubTaskForm';
import { SubTaskDetailsDialog } from '../../../SubTaskDetailsDialog';
import { toast } from 'sonner';
import { getImportanceColor } from '@/components/project/shared/utils/taskHelpers';
import { Task, SubTask } from '@/types/tasks';
import { Project, Member } from '@/types/project';

interface SubTaskItemProps {
  subtask: SubTask; 
  task: Task;
  project: Project;
  onSubTaskUpdated: (updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskDeleted: (subtaskId: string) => void;
}

function SubTaskItem({ 
  subtask, 
  task,
  project, 
  onSubTaskUpdated,
  onSubTaskDeleted
}: SubTaskItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const canUpdateSubtask = subtask.assignedId === project.currentUserId || 
                          project.isLeader || 
                          project.userPermissions.includes('updateTask');

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
            
            {canUpdateSubtask && (
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
        mainTaskId={task.id}
        mainTaskDeadline={task.deadline}
        projectDeadline={project.deadline}
        members={project.members}
        onSubTaskUpdated={handleSubTaskUpdatedCallback}
        onSubTaskDeleted={onSubTaskDeleted}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

interface TaskCardProps {
  task: Task; 
  project: Project;
  onTaskUpdated: (updatedTask: Partial<Task> & { id: string }) => void;
  onTaskDeleted: (taskId: string) => void;
  onSubTaskUpdated: (taskId: string, updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskCreated: (taskId: string, newSubTask: SubTask) => void;
  onSubTaskDeleted: (taskId: string, subtaskId: string) => void;
}

export function TaskCard({ 
  task, 
  project, 
  onTaskUpdated,
  onTaskDeleted,
  onSubTaskUpdated,
  onSubTaskCreated,
  onSubTaskDeleted
}: TaskCardProps) {
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
  const canViewAllTasks = project.isLeader || project.userPermissions.includes('viewFiles');

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium border ${getImportanceColor(task.importanceLevel)}`}
                >
                  {task.importanceLevel.charAt(0).toUpperCase() + task.importanceLevel.slice(1)}
                </Badge>
                {!canViewAllTasks && (
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
                <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center">
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
                    task={task}
                    project={project}
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

      <CreateSubTaskForm 
        projectId={project.id}
        mainTaskId={task.id}
        mainTaskDeadline={task.deadline}
        projectDeadline={project.deadline}
        open={showCreateSubTaskDialog}
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
} 