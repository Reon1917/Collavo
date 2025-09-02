import { useState, useEffect } from 'react';
import { EditMode, StatusFormData, DetailsFormData, SubTaskPermissions, ModalMode, SubTaskCapabilities } from '../types';
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

  // Determine modal mode based on capabilities
  const getModalMode = (): ModalMode => {
    const isAssigned = currentUserId === subTask.assignedId;
    const hasUpdateTask = userPermissions.includes('updateTask');
    const hasHandleTask = userPermissions.includes('handleTask');
    
    if (isProjectLeader) {
      return 'management';
    }
    
    if (hasHandleTask) {
      return 'full-edit';
    }
    
    if (hasUpdateTask || isAssigned) {
      return 'status-update';
    }
    
    return 'view-only';
  };

  // Get contextual action text (same logic as SubTaskMiniItem)
  const getActionText = (): string => {
    const isAssigned = currentUserId === subTask.assignedId;
    const hasUpdateTask = userPermissions.includes('updateTask');
    const hasHandleTask = userPermissions.includes('handleTask');
    
    if (isProjectLeader) {
      return 'Manage';
    }
    
    if (hasHandleTask) {
      return 'Edit';
    }
    
    if (hasUpdateTask) {
      return isAssigned ? 'Update' : 'Update Status';
    }
    
    if (isAssigned) {
      return 'Update';
    }
    
    return 'View';
  };

  const capabilities: SubTaskCapabilities = {
    modalMode: getModalMode(),
    permissions,
    actionText: getActionText(),
    canDelete: isProjectLeader || userPermissions.includes('handleTask'),
    showAdvancedActions: isProjectLeader || userPermissions.includes('handleTask')
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
    capabilities,
    resetDetailsForm,
    handleDialogClose
  };
} 