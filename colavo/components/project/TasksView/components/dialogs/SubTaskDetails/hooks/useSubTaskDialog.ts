import { useState, useEffect } from 'react';
import { EditMode, StatusFormData, DetailsFormData, SubTaskPermissions } from '../types';
import { SubTask } from '../../../../types';

export function useSubTaskDialog(
  subTask: SubTask,
  currentUserId: string,
  isProjectLeader: boolean,
  userPermissions: string[],
  isOpen: boolean
) {
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [statusFormData, setStatusFormData] = useState<StatusFormData>({
    status: subTask.status,
    note: subTask.note || ''
  });

  const [detailsFormData, setDetailsFormData] = useState<DetailsFormData>({
    title: subTask.title,
    description: subTask.description || '',
    assignedId: subTask.assignedId || '',
    deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
  });

  // Calculate permissions based on the new permission system
  const permissions: SubTaskPermissions = {
    canUpdateStatus: currentUserId === subTask.assignedId || 
                    isProjectLeader || 
                    userPermissions.includes('updateTask'),
    canEditDetails: isProjectLeader || 
                   userPermissions.includes('handleTask')
  };

  // Reset form data when subtask changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setStatusFormData({
        status: subTask.status,
        note: subTask.note || ''
      });
      setDetailsFormData({
        title: subTask.title,
        description: subTask.description || '',
        assignedId: subTask.assignedId || '',
        deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
      });
      setEditMode('view');
    }
  }, [subTask, isOpen]);

  const resetStatusForm = () => {
    setStatusFormData({
      status: subTask.status,
      note: subTask.note || ''
    });
  };

  const resetDetailsForm = () => {
    setDetailsFormData({
      title: subTask.title,
      description: subTask.description || '',
      assignedId: subTask.assignedId || '',
      deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
    });
  };

  const handleModeChange = (mode: EditMode) => {
    setEditMode(mode);
  };

  const handleDialogClose = () => {
    setEditMode('view');
    setShowDeleteDialog(false);
  };

  return {
    editMode,
    setEditMode: handleModeChange,
    showDeleteDialog,
    setShowDeleteDialog,
    statusFormData,
    setStatusFormData,
    detailsFormData,
    setDetailsFormData,
    permissions,
    resetStatusForm,
    resetDetailsForm,
    handleDialogClose
  };
} 