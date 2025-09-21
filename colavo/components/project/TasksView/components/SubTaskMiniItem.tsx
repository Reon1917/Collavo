import { useState } from 'react';
import { SubTaskDetailsDialog } from './dialogs/SubTaskDetails';
import { SubTaskNotificationModal } from './dialogs/SubTaskNotificationModal';
import { Task, SubTask, Project } from '../types';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SubTaskMiniItemProps {
  subtask: SubTask;
  task: Task;
  project: Project;
  onSubTaskUpdated: (updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskDeleted: (subtaskId: string) => void;
}

export function SubTaskMiniItem({
  subtask,
  task,
  project,
  onSubTaskUpdated,
  onSubTaskDeleted
}: SubTaskMiniItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editingStatus, setEditingStatus] = useState(subtask.status);
  const [isUpdating, setIsUpdating] = useState(false);

  // Members should always be able to view subtask details (read-only if no edit permissions)
  const canViewSubtask = true;

  const handleSubTaskUpdatedCallback = (updatedSubTask: Partial<SubTask> & { id: string }) => {
    onSubTaskUpdated(updatedSubTask);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Permission checks for inline status editing
  const canUpdateStatusInline = project.isLeader ||
    (project.userPermissions.includes('updateTask') && project.userPermissions.includes('handleTask'));

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canUpdateStatusInline) {
      setIsEditingStatus(true);
      setEditingStatus(subtask.status);
    }
  };

  const handleStatusSave = async () => {
    if (editingStatus === subtask.status) {
      setIsEditingStatus(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/tasks/${task.id}/subtasks/${subtask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editingStatus })
      });

      if (response.ok) {
        const updatedSubTask = await response.json();
        onSubTaskUpdated(updatedSubTask);
        toast.success('Status updated successfully');
        setIsEditingStatus(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusCancel = () => {
    setIsEditingStatus(false);
    setEditingStatus(subtask.status);
  };

  const handleStatusChange = (value: string) => {
    if (value === 'pending' || value === 'in_progress' || value === 'completed') {
      setEditingStatus(value);
    }
  };

  // Get contextual action text based on actual permissions and capabilities
  const getContextualActionText = () => {
    const isAssigned = subtask.assignedId === project.currentUserId;
    const isLeader = project.isLeader;
    const hasUpdateTask = project.userPermissions.includes('updateTask');
    const hasHandleTask = project.userPermissions.includes('handleTask');
    
    // Leaders have full management access
    if (isLeader) {
      return 'Manage';
    }
    
    // Users with both handleTask and updateTask permissions get "Manage"
    if (hasHandleTask && (hasUpdateTask || isAssigned)) {
      return 'Manage';
    }
    
    // Non-leaders with only handleTask permission can edit details
    if (hasHandleTask) {
      return 'Edit';
    }
    
    // Users with updateTask permission can update status/notes of any subtask
    if (hasUpdateTask) {
      return isAssigned ? 'Update' : 'Update Status';
    }
    
    // Assignees can update status/notes of their own subtasks
    if (isAssigned) {
      return 'Update';
    }
    
    // Everyone else can only view
    return 'View';
  };

  const actionText = getContextualActionText();

  return (
    <>
      <div
        className={`flex items-center gap-2 text-xs p-2 rounded border border-gray-200 dark:border-gray-700 transition-colors ${
          canViewSubtask && !isEditingStatus ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
        }`}
        onClick={canViewSubtask && !isEditingStatus ? handleOpenDialog : undefined}
      >
        {/* Status dot or status selector */}
        {isEditingStatus ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={editingStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-24 h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleStatusSave}
              disabled={isUpdating}
              className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStatusCancel}
              disabled={isUpdating}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              subtask.status === 'completed' ? 'bg-green-500' :
              subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
            } ${canUpdateStatusInline ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={handleStatusClick}
            title={canUpdateStatusInline ? 'Click to change status' : ''}
          />
        )}

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <span className="truncate text-gray-700 dark:text-gray-300 block">
            {subtask.title}
          </span>
          {subtask.assignedUserName && (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {subtask.assignedId === project.currentUserId ? 'You' : subtask.assignedUserName}
            </span>
          )}
        </div>

        {/* Right side container with bell and action text */}
        {!isEditingStatus && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification bell - positioned just before action text */}
            {subtask.deadline && subtask.assignedId && (
              // Only show notification button if user is project leader or assigned to this subtask
              (project.isLeader || subtask.assignedId === project.currentUserId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNotificationModalOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsNotificationModalOpen(true);
                    }
                  }}
                  aria-label={`Set up email reminder for ${subtask.title}`}
                  className="h-7 w-7 p-0 rounded-md border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                             hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-600
                             hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30
                             transition-all duration-200 ease-out group"
                  title="Set up email reminder"
                >
                  <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                </Button>
              )
            )}

            {/* Action text - consistent positioning */}
            <span className={`text-xs font-medium transition-colors duration-200 cursor-pointer ${
              actionText === 'Manage'
                ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
                : actionText === 'Edit'
                ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200'
                : actionText.startsWith('Update')
                ? 'text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
              {actionText}
            </span>
          </div>
        )}
      </div>

      {/* Lazy render Subtask Details Dialog only when opened */}
      {isDialogOpen && (
        <SubTaskDetailsDialog
          subTask={subtask}
          currentUserId={project.currentUserId}
          isProjectLeader={project.isLeader}
          userPermissions={project.userPermissions}
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
      )}

      {/* Lazy render Notification Modal only when opened and user has permission */}
      {subtask.deadline && subtask.assignedId && isNotificationModalOpen && 
       (project.isLeader || subtask.assignedId === project.currentUserId) && (
        <SubTaskNotificationModal
          subTask={subtask}
          projectId={project.id}
          taskId={task.id}
          isOpen={isNotificationModalOpen}
          onOpenChange={setIsNotificationModalOpen}
        />
      )}
    </>
  );
} 