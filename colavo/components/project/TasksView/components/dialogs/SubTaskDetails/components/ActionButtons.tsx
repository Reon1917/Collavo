import { Button } from '@/components/ui/button';
import { Loader2, Edit3, Settings, Trash2, Eye, User } from 'lucide-react';
import { EditMode, SubTaskPermissions, SubTaskCapabilities } from '../types';

interface ActionButtonsProps {
  editMode: EditMode;
  permissions: SubTaskPermissions;
  capabilities?: SubTaskCapabilities;
  isLoading: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onDetailsEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit?: () => void;
  hasStatusChanges?: boolean;
  hasDetailsChanges?: boolean;
}

export function ActionButtons({
  editMode,
  permissions,
  capabilities,
  isLoading,
  isDeleting,
  onClose,
  onDetailsEdit,
  onDelete,
  onCancel,
  onSubmit,
  hasStatusChanges = false,
  hasDetailsChanges = false
}: ActionButtonsProps) {
  if (editMode === 'view') {
    const hasAnyPermissions = permissions.canUpdateStatus || permissions.canEditDetails;
    const modalMode = capabilities?.modalMode || 'view-only';
    
    // View-only mode - just close button
    if (modalMode === 'view-only') {
      return (
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full"
          disabled={isDeleting}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Close
        </Button>
      );
    }
    
    // Determine if we need multiple action buttons (affects close button size)
    const hasMultipleActions = modalMode === 'full-access' || modalMode === 'full-edit';

    return (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className={hasAnyPermissions ? (hasMultipleActions ? "flex-none w-20" : "flex-1") : "w-full"}
          disabled={isDeleting}
        >
          Close
        </Button>
        {hasAnyPermissions && (
          <div className="flex gap-2 flex-1">
            {/* Status-update mode - Submit button for status form */}
            {modalMode === 'status-update' && permissions.canUpdateStatus && (
              <Button
                type="submit"
                className={`flex-1 h-9 transition-all duration-200 ${
                  hasStatusChanges
                    ? 'bg-primary hover:bg-primary/90 shadow-sm text-primary-foreground'
                    : 'bg-muted hover:bg-muted/90 text-muted-foreground cursor-not-allowed opacity-60'
                }`}
                disabled={isLoading || !hasStatusChanges}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-1.5" />
                    Save Update
                  </>
                )}
              </Button>
            )}

            {/* Full-access mode - Both save update and edit details buttons */}
            {modalMode === 'full-access' && (
              <>
                <Button
                  type="submit"
                  className={`flex-1 h-9 transition-all duration-200 ${
                    hasStatusChanges
                      ? 'bg-primary hover:bg-primary/90 shadow-sm text-primary-foreground'
                      : 'bg-muted hover:bg-muted/90 text-muted-foreground cursor-not-allowed opacity-60'
                  }`}
                  disabled={isLoading || !hasStatusChanges}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-1.5" />
                      Save Update
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={onDetailsEdit}
                  className="flex-1 h-9 bg-primary hover:bg-primary/90 hover:shadow-md text-primary-foreground transition-all duration-200"
                  disabled={isDeleting}
                >
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Edit Details
                </Button>
              </>
            )}
            
            {/* Full-edit mode - Secondary emerald */}
            {modalMode === 'full-edit' && permissions.canEditDetails && (
              <Button
                type="button"
                onClick={onDetailsEdit}
                className="flex-1 h-9 bg-primary hover:bg-primary/90 hover:shadow-md text-primary-foreground transition-all duration-200"
                disabled={isDeleting}
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                Edit Details
              </Button>
            )}
          </div>
        )}
      </>
    );
  }

  // Edit mode buttons with capability-based colors

  
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className={capabilities?.canDelete && editMode === 'details' ? "flex-1 h-9" : "flex-1 h-9"}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading || (editMode === 'details' ? !hasDetailsChanges : !hasStatusChanges)}
        className={`flex-1 h-9 transition-all duration-200 ${
          editMode === 'details'
            ? hasDetailsChanges
              ? 'bg-primary hover:bg-primary/90 hover:shadow-md text-primary-foreground shadow-sm transition-all duration-200'
              : 'bg-muted hover:bg-muted/90 text-muted-foreground cursor-not-allowed opacity-60'
            : hasStatusChanges
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
              : 'bg-muted hover:bg-muted/90 text-muted-foreground cursor-not-allowed opacity-60'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            {editMode === 'details' ? 'Saving...' : 'Updating...'}
          </>
        ) : (
          <>
            {editMode === 'details' ? (
              <>
                <Settings className="h-4 w-4 mr-1.5" />
                Save Changes
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-1.5" />
                Save Update
              </>
            )}
          </>
        )}
      </Button>
      {/* Delete button in details edit mode for full-access users */}
      {capabilities?.canDelete && editMode === 'details' && (
        <Button
          type="button"
          onClick={onDelete}
          variant="outline"
          className="h-9 px-3 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 dark:border-destructive/30 dark:text-destructive dark:hover:bg-destructive/10 dark:hover:text-destructive"
          disabled={isDeleting || isLoading}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </>
  );
} 