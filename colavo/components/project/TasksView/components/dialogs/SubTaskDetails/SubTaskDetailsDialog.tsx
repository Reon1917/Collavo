"use client";

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useSubTaskDialog } from './hooks/useSubTaskDialog';
import { useSubTaskActions } from './hooks/useSubTaskActions';
import { DialogHeader as CustomDialogHeader } from './components/DialogHeader';
import { SubTaskInfoCard } from './components/SubTaskInfoCard';
import { StatusUpdateForm } from './components/StatusUpdateForm';
import { DetailsEditForm } from './components/DetailsEditForm';
import { ActionButtons } from './components/ActionButtons';
import { SubTaskDetailsDialogProps } from './types';

export function SubTaskDetailsDialog({
  subTask,
  currentUserId,
  isProjectLeader,
  userPermissions,
  projectId,
  mainTaskId,
  mainTaskDeadline,
  projectDeadline,
  members,
  onSubTaskUpdated,
  onSubTaskDeleted,
  isOpen,
  onOpenChange
}: SubTaskDetailsDialogProps) {
  const {
    editMode,
    setEditMode,
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
  } = useSubTaskDialog(subTask, currentUserId, isProjectLeader, userPermissions, isOpen);

  const {
    isLoading,
    isDeleting,
    updateStatus,
    updateDetails,
    deleteSubTask
  } = useSubTaskActions(projectId, mainTaskId, mainTaskDeadline, projectDeadline);

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      handleDialogClose();
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!permissions.canUpdateStatus) {
      return;
    }

    const success = await updateStatus(subTask.id, subTask, statusFormData, onSubTaskUpdated!);
    if (success) {
      setEditMode('view');
      setTimeout(() => handleDialogOpenChange(false), 500);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!permissions.canEditDetails) {
      return;
    }

    const success = await updateDetails(subTask.id, detailsFormData, onSubTaskUpdated!);
    if (success) {
      setEditMode('view');
      setTimeout(() => handleDialogOpenChange(false), 500);
    }
  };

  const handleDelete = async () => {
    const success = await deleteSubTask(subTask.id, onSubTaskDeleted!);
    if (success) {
      setShowDeleteDialog(false);
      handleDialogOpenChange(false);
    }
  };


  const handleDetailsCancel = () => {
    resetDetailsForm();
    // For full-edit mode users (edit permission only), close the modal directly
    if (capabilities.modalMode === 'full-edit') {
      handleDialogOpenChange(false);
    } else {
      setEditMode('view');
    }
  };

  // Get modal size based on capabilities
  const getModalSize = () => {
    switch (capabilities.modalMode) {
      case 'view-only':
        return 'max-w-lg'; // Small - 32rem (512px)
      case 'status-update':
        return 'max-w-xl'; // Medium - 36rem (576px)
      case 'full-edit':
        return 'max-w-xl'; // Compact - 36rem (576px) since they go directly to edit
      case 'full-access':
        return 'max-w-2xl'; // Large - 42rem (672px)
      default:
        return 'max-w-2xl';
    }
  };

  // Render content based on modal mode
  const renderModalContent = () => {
    // For view-only mode, show only SubTaskInfoCard
    if (capabilities.modalMode === 'view-only') {
      return (
        <>
          <SubTaskInfoCard subTask={subTask} currentUserId={currentUserId} />
          <div className="flex justify-end pt-3 border-t border-border dark:border-border">
            <button
              onClick={() => handleDialogOpenChange(false)}
              className="px-4 py-2 text-foreground dark:text-foreground bg-muted dark:bg-muted rounded-md hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors"
            >
              Close
            </button>
          </div>
        </>
      );
    }

    // For other modes, show the current full dialog structure
    if (editMode === 'details' && capabilities.permissions.canEditDetails) {
      return (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          {/* Lazy load DetailsEditForm only when in details edit mode */}
          <DetailsEditForm
            detailsFormData={detailsFormData}
            setDetailsFormData={setDetailsFormData}
            members={members}
            mainTaskDeadline={mainTaskDeadline}
            projectDeadline={projectDeadline}
            isLoading={isLoading}
            isManagementMode={false}
            isFullEditMode={capabilities.modalMode === 'full-edit'}
          />
          
          <div className="flex gap-3 pt-3 border-t border-border dark:border-border">
            <ActionButtons
              editMode={editMode}
              permissions={permissions}
              capabilities={capabilities}
              isLoading={isLoading}
              isDeleting={isDeleting}
              onClose={() => handleDialogOpenChange(false)}
              onDetailsEdit={() => setEditMode('details')}
              onDelete={() => setShowDeleteDialog(true)}
              onCancel={handleDetailsCancel}
              hasStatusChanges={hasStatusChanges}
              hasDetailsChanges={hasDetailsChanges}
            />
          </div>
        </form>
      );
    }

    // Default view with status form
    return (
      <>
        <SubTaskInfoCard subTask={subTask} currentUserId={currentUserId} />

        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <StatusUpdateForm
            subTask={subTask}
            statusFormData={statusFormData}
            setStatusFormData={setStatusFormData}
            editMode="status"
            isLoading={isLoading}
          />

          <div className="flex gap-3 pt-3 border-t border-border dark:border-border">
            <ActionButtons
              editMode="view"
              permissions={permissions}
              capabilities={capabilities}
              isLoading={isLoading}
              isDeleting={isDeleting}
              onClose={() => handleDialogOpenChange(false)}
              onDetailsEdit={() => setEditMode('details')}
              onDelete={() => setShowDeleteDialog(true)}
              onCancel={() => {}}
              hasStatusChanges={hasStatusChanges}
              hasDetailsChanges={hasDetailsChanges}
            />
          </div>
        </form>
      </>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className={`${getModalSize()} bg-background dark:bg-background border border-border dark:border-border max-h-[85vh] overflow-y-auto`}>
          <DialogHeader className="pb-3 border-b border-border dark:border-border">
            <CustomDialogHeader editMode={editMode} subTask={subTask} />
          </DialogHeader>

          <div className="space-y-4 py-3">
            {renderModalContent()}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Subtask"
        description="Are you sure you want to delete this subtask? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
} 