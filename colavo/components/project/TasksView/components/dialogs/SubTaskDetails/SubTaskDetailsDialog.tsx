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
    resetStatusForm,
    resetDetailsForm,
    handleDialogClose
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

  const handleStatusCancel = () => {
    resetStatusForm();
    setEditMode('view');
  };

  const handleDetailsCancel = () => {
    resetDetailsForm();
    setEditMode('view');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
            <CustomDialogHeader editMode={editMode} subTask={subTask} />
          </DialogHeader>

          <div className="space-y-4 py-3">
            {editMode === 'details' ? (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <DetailsEditForm
                  detailsFormData={detailsFormData}
                  setDetailsFormData={setDetailsFormData}
                  members={members}
                  mainTaskDeadline={mainTaskDeadline}
                  projectDeadline={projectDeadline}
                  isLoading={isLoading}
                />
                
                <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <ActionButtons
                    editMode={editMode}
                    permissions={permissions}
                    isLoading={isLoading}
                    isDeleting={isDeleting}
                    onClose={() => handleDialogOpenChange(false)}
                    onStatusEdit={() => setEditMode('status')}
                    onDetailsEdit={() => setEditMode('details')}
                    onDelete={() => setShowDeleteDialog(true)}
                    onCancel={handleDetailsCancel}
                  />
                </div>
              </form>
            ) : (
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

                  <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <ActionButtons
                      editMode="view"
                      permissions={permissions}
                      isLoading={isLoading}
                      isDeleting={isDeleting}
                      onClose={() => handleDialogOpenChange(false)}
                      onStatusEdit={() => {}}
                      onDetailsEdit={() => setEditMode('details')}
                      onDelete={() => setShowDeleteDialog(true)}
                      onCancel={() => {}}
                    />
                  </div>
                </form>
              </>
            )}
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