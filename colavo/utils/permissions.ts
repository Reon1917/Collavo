import { toast } from 'sonner';

export interface PermissionErrorResponse {
  error: string;
  errorType: 'NO_ACCESS' | 'PERMISSION_REVOKED' | 'INVALID_PROJECT';
  requiredPermission: string;
  currentPermissions: string[];
  shouldRefreshPermissions: boolean;
}

/**
 * Handle permission error responses from API calls
 * Shows appropriate toast notifications and triggers permission refresh
 */
export function handlePermissionError(
  error: PermissionErrorResponse,
  onPermissionRefresh?: () => void
) {
  // Show user-friendly toast notification
  switch (error.errorType) {
    case 'PERMISSION_REVOKED':
      toast.error('Permission Revoked', {
        description: `Your permission to perform this action has been revoked by the project leader.`,
        duration: 5000,
      });
      break;
      
    case 'NO_ACCESS':
      toast.error('Access Denied', {
        description: 'You no longer have access to this project.',
        duration: 5000,
      });
      break;
      
    case 'INVALID_PROJECT':
      toast.error('Project Not Found', {
        description: 'This project may have been deleted.',
        duration: 5000,
      });
      break;
      
    default:
      toast.error('Access Denied', {
        description: error.error,
        duration: 5000,
      });
  }
  
  // Trigger permission refresh if needed
  if (error.shouldRefreshPermissions && onPermissionRefresh) {
    onPermissionRefresh();
  }
}

/**
 * Enhanced API call wrapper that handles permission errors
 */
export async function makePermissionAwareRequest<T>(
  request: () => Promise<Response>,
  onPermissionRefresh?: () => void
): Promise<T> {
  const response = await request();
  
  if (!response.ok) {
    const errorData = await response.json();
    
    // Check if this is a permission error with detailed info
    if (errorData.errorType && errorData.shouldRefreshPermissions !== undefined) {
      handlePermissionError(errorData as PermissionErrorResponse, onPermissionRefresh);
      throw new Error(errorData.error);
    }
    
    // Regular error handling
    throw new Error(errorData.error || 'Request failed');
  }
  
  return response.json();
}

/**
 * Check if an error response indicates a permission issue
 */
export function isPermissionError(error: any): error is PermissionErrorResponse {
  return error && 
         error.errorType && 
         ['NO_ACCESS', 'PERMISSION_REVOKED', 'INVALID_PROJECT'].includes(error.errorType);
} 