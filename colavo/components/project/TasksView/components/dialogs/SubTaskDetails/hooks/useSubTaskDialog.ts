import { useState, useEffect, useCallback } from 'react';
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
    deadline: subTask.deadline ? new Date(subTask.deadline) : undefined,
    status: subTask.status,
    note: subTask.note || ''
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
  const getModalMode = useCallback((): ModalMode => {
    const isAssigned = currentUserId === subTask.assignedId;
    const hasUpdateTask = userPermissions.includes('updateTask');
    const hasHandleTask = userPermissions.includes('handleTask');
    
    if (isProjectLeader) {
      return 'management';
    }
    
    // Users with both handleTask and updateTask permissions get full access
    if (hasHandleTask && (hasUpdateTask || isAssigned)) {
      return 'full-access';
    }
    
    if (hasHandleTask) {
      return 'full-edit';
    }
    
    if (hasUpdateTask || isAssigned) {
      return 'status-update';
    }
    
    return 'view-only';
  }, [currentUserId, subTask.assignedId, userPermissions, isProjectLeader]);

  // Get contextual action text (same logic as SubTaskMiniItem)
  const getActionText = (): string => {
    const isAssigned = currentUserId === subTask.assignedId;
    const hasUpdateTask = userPermissions.includes('updateTask');
    const hasHandleTask = userPermissions.includes('handleTask');
    
    if (isProjectLeader) {
      return 'Manage';
    }
    
    // Users with both handleTask and updateTask permissions get "Manage"
    if (hasHandleTask && (hasUpdateTask || isAssigned)) {
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

  // Change detection for status updates
  const hasStatusChanges = 
    statusFormData.status !== subTask.status || 
    statusFormData.note.trim() !== (subTask.note || '').trim();

  // Change detection for details updates
  const hasDetailsChanges = 
    detailsFormData.title.trim() !== subTask.title.trim() ||
    (detailsFormData.description || '').trim() !== (subTask.description || '').trim() ||
    detailsFormData.assignedId !== (subTask.assignedId || '') ||
    (() => {
      // Compare deadlines using epoch milliseconds to avoid timezone/precision issues
      const formDeadlineMs = detailsFormData.deadline?.getTime();
      const subTaskDeadlineMs = subTask.deadline ? new Date(subTask.deadline).getTime() : undefined;
      // Both undefined/null are considered equal
      return formDeadlineMs !== subTaskDeadlineMs;
    })() ||
    (detailsFormData.status !== undefined && detailsFormData.status !== subTask.status) ||
    ((detailsFormData.note || '').trim() !== (subTask.note || '').trim());

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
        deadline: subTask.deadline ? new Date(subTask.deadline) : undefined,
        status: subTask.status,
        note: subTask.note || ''
      });
      
      // For full-edit mode (manage task only), go directly to details edit
      const modalMode = getModalMode();
      if (modalMode === 'full-edit') {
        setEditMode('details');
      } else {
        setEditMode('view');
      }
    }
  }, [subTask, isOpen, getModalMode]);

  const resetDetailsForm = () => {
    setDetailsFormData({
      title: subTask.title,
      description: subTask.description || '',
      assignedId: subTask.assignedId || '',
      deadline: subTask.deadline ? new Date(subTask.deadline) : undefined,
      status: subTask.status,
      note: subTask.note || ''
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
    handleDialogClose,
    hasStatusChanges,
    hasDetailsChanges
  };
} 