import { useState } from 'react';
import { SubTaskDetailsDialog } from './dialogs/SubTaskDetails';
import { Task, SubTask, Project } from '../types';

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
  
  // Check if user can update this subtask
  const canUpdateSubtask = subtask.assignedId === project.currentUserId || 
                          project.isLeader || 
                          project.userPermissions.includes('updateTask');

  const handleSubTaskUpdatedCallback = (updatedSubTask: Partial<SubTask> & { id: string }) => {
    onSubTaskUpdated(updatedSubTask);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div 
        className={`flex items-center gap-2 text-xs p-2 rounded border border-gray-200 dark:border-gray-700 transition-colors ${
          canUpdateSubtask ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
        }`}
        onClick={canUpdateSubtask ? handleOpenDialog : undefined}
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
              {subtask.assignedUserName === project.currentUserId ? 'You' : subtask.assignedUserName}
            </span>
          )}
        </div>
        {canUpdateSubtask && (
          <span className="text-gray-400 text-xs">Click to edit</span>
        )}
      </div>

      {/* Subtask Details Dialog */}
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