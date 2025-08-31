import { useState } from 'react';
import { SubTaskDetailsDialog } from './dialogs/SubTaskDetails';
import { SubTaskNotificationModal } from './dialogs/SubTaskNotificationModal';
import { Task, SubTask, Project } from '../types';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  
  // Check if user can update this subtask
  const canUpdateSubtask = subtask.assignedId === project.currentUserId || 
                          project.isLeader || 
                          project.userPermissions.includes('updateTask') ||
                          project.userPermissions.includes('handleTask');

  // Members should always be able to view subtask details (read-only if no edit permissions)
  const canViewSubtask = true;

  const handleSubTaskUpdatedCallback = (updatedSubTask: Partial<SubTask> & { id: string }) => {
    onSubTaskUpdated(updatedSubTask);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Get contextual action text based on permissions and assignment
  const getContextualActionText = () => {
    const isAssigned = subtask.assignedId === project.currentUserId;
    const isOwner = project.isLeader;
    const hasTaskPermissions = project.userPermissions.includes('updateTask') || 
                              project.userPermissions.includes('handleTask');
    
    if (isOwner || hasTaskPermissions) {
      return isAssigned ? 'Update Task' : 'Edit Task';
    }
    return 'View';
  };

  const actionText = getContextualActionText();
  const isPrimaryAction = actionText !== 'View';

  return (
    <>
      <div 
        className={`flex items-center gap-2 text-xs p-2 rounded border border-gray-200 dark:border-gray-700 transition-colors ${
          canViewSubtask ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
        }`}
        onClick={canViewSubtask ? handleOpenDialog : undefined}
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          subtask.status === 'completed' ? 'bg-green-500' :
          subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
        }`} />
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
        
        <span className={`text-xs font-medium transition-colors duration-200 cursor-pointer ml-2 ${
          isPrimaryAction 
            ? actionText === 'Update Task'
              ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
              : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}>
          {actionText}
        </span>

        {subtask.deadline && subtask.assignedId && (
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
                       transition-all duration-200 ease-out group flex-shrink-0 ml-2"
            title="Set up email reminder"
          >
            <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
          </Button>
        )}
      </div>

      {/* Subtask Details Dialog */}
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

      {/* Notification Modal */}
      {subtask.deadline && subtask.assignedId && (
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