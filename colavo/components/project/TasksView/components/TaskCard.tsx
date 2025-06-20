import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  User, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { toast } from 'sonner';
import { CreateSubTaskForm } from './forms/CreateSubTaskForm';
import { EditTaskDialog } from './dialogs/EditTaskDialog';
import { SubTaskMiniItem } from './SubTaskMiniItem';
import { Task, Project, SubTask, getImportanceColor } from '../types';

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
  
  // All project members can see all subtasks
  const visibleSubTasks = task.subTasks;

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

  // Permission checks
  const canModifyTask = project.isLeader || project.userPermissions.includes('handleTask');
  const canCreateSubtasks = project.isLeader || project.userPermissions.includes('createTask');
  const canViewAllTasks = true; // All members can view all tasks

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium border ${getImportanceColor(task.importanceLevel)}`}
                >
                  {task.importanceLevel.charAt(0).toUpperCase() + task.importanceLevel.slice(1)}
                </Badge>
                {!canViewAllTasks && (
                  <Badge variant="secondary" className="text-xs">
                    Your Tasks
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {task.description}
                </CardDescription>
              )}
            </div>
            {(canModifyTask || canCreateSubtasks) && (
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="h-7 w-7 p-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center flex-shrink-0 ml-2"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
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

        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* Progress */}
          {visibleSubTasks.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-xs">Progress</span>
                <span className="text-xs font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {completedSubTasks}/{totalSubTasks} completed
              </p>
            </div>
          )}

          {/* Sub-tasks preview */}
          {visibleSubTasks.length > 0 ? (
            <div className="flex-1 min-h-0">
              <div className="mb-2">
                <h4 className="text-xs font-medium text-gray-900 dark:text-white">
                  Subtasks ({visibleSubTasks.length})
                </h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {visibleSubTasks.slice(0, 3).map((subtask) => (
                  <SubTaskMiniItem 
                    key={subtask.id} 
                    subtask={subtask} 
                    task={task}
                    project={project}
                    onSubTaskUpdated={(updatedSubTask) => onSubTaskUpdated(task.id, updatedSubTask)}
                    onSubTaskDeleted={(subtaskId) => onSubTaskDeleted(task.id, subtaskId)}
                  />
                ))}
                {visibleSubTasks.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    +{visibleSubTasks.length - 3} more
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                {!canViewAllTasks 
                  ? 'No subtasks assigned'
                  : 'No subtasks yet'
                }
              </p>
            </div>
          )}

          {/* Task metadata */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-1 min-w-0">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{task.creatorName}</span>
              </div>
              {task.deadline && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span className={`${isAfter(new Date(), new Date(task.deadline)) ? 'text-red-500' : ''}`}>
                    {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
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

      {/* Create SubTask Dialog */}
      {showCreateSubTaskDialog && (
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
      )}

      {/* Delete Confirmation Dialog */}
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