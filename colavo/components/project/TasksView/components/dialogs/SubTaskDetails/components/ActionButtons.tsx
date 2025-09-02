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
  onSubmit
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
    
    return (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className={hasAnyPermissions ? "flex-1" : "w-full"}
          disabled={isDeleting}
        >
          Close
        </Button>
        {hasAnyPermissions && (
          <div className="flex gap-2 flex-1">
            {/* Management mode - Primary blue */}
            {modalMode === 'management' && permissions.canEditDetails && (
              <Button
                type="button"
                onClick={onDetailsEdit}
                className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isDeleting}
              >
                <Settings className="h-4 w-4 mr-1.5" />
                Manage Task
              </Button>
            )}
            
            {/* Full-edit mode - Secondary green */}
            {modalMode === 'full-edit' && permissions.canEditDetails && (
              <Button
                type="button"
                onClick={onDetailsEdit}
                className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isDeleting}
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                Edit Details
              </Button>
            )}
            
            {/* Status-update mode - Accent orange (no details edit, status handled in form) */}
            {modalMode === 'status-update' && !permissions.canEditDetails && (
              <Button
                type="button"
                onClick={() => {}} // Status update is handled in the form
                className="flex-1 h-9 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={true} // Always disabled as status form is always visible
              >
                <User className="h-4 w-4 mr-1.5" />
                Status Form Active
              </Button>
            )}
            
            {/* Delete button for users with handleTask permission */}
            {capabilities?.canDelete && (
              <Button
                type="button"
                onClick={onDelete}
                variant="outline"
                className="h-9 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </>
    );
  }

  // Edit mode buttons with capability-based colors
  const modalMode = capabilities?.modalMode || 'view-only';
  
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 h-9"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading}
        className={`flex-1 h-9 text-white ${
          editMode === 'details' 
            ? modalMode === 'management'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-orange-600 hover:bg-orange-700'
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
              modalMode === 'management' ? (
                <>
                  <Settings className="h-4 w-4 mr-1.5" />
                  Save Management
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Save Changes
                </>
              )
            ) : (
              <>
                <User className="h-4 w-4 mr-1.5" />
                Save Update
              </>
            )}
          </>
        )}
      </Button>
    </>
  );
} 