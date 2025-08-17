import { Button } from '@/components/ui/button';
import { Loader2, Edit3, Settings, Trash2 } from 'lucide-react';
import { EditMode, SubTaskPermissions } from '../types';

interface ActionButtonsProps {
  editMode: EditMode;
  permissions: SubTaskPermissions;
  isLoading: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onStatusEdit: () => void;
  onDetailsEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit?: () => void;
}

export function ActionButtons({
  editMode,
  permissions,
  isLoading,
  isDeleting,
  onClose,
  onStatusEdit,
  onDetailsEdit,
  onDelete,
  onCancel,
  onSubmit
}: ActionButtonsProps) {
  if (editMode === 'view') {
    const hasAnyPermissions = permissions.canUpdateStatus || permissions.canEditDetails;
    
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
            {permissions.canUpdateStatus && (
              <Button
                type="button"
                onClick={onStatusEdit}
                className="flex-1 bg-primary hover:bg-[#006666] text-foreground"
                disabled={isDeleting}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            )}
            {permissions.canEditDetails && (
              <Button
                type="button"
                onClick={onDetailsEdit}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
            {permissions.canEditDetails && (
              <Button
                type="button"
                onClick={onDelete}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
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

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading}
        className="flex-1 bg-primary hover:bg-[#006666] text-foreground"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {editMode === 'details' ? 'Saving...' : 'Updating...'}
          </>
        ) : (
          editMode === 'details' ? 'Save Changes' : 'Save Update'
        )}
      </Button>
    </>
  );
} 