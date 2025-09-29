import { toast } from 'sonner';

export interface PermissionErrorResponse {
  error: string;
  errorType: 'NO_ACCESS' | 'PERMISSION_REVOKED' | 'INVALID_PROJECT' | 'PROJECT_DELETED';
  requiredPermission?: string;
  currentPermissions?: string[];
  shouldRefreshPermissions?: boolean;
  shouldRedirect?: boolean;
  redirectTo?: string;
}

/**
 * Handle permission error responses from API calls
 * Shows appropriate toast notifications and triggers permission refresh
 */
export function handlePermissionError(
  error: PermissionErrorResponse,
  onPermissionRefresh?: () => void
) {
  // Early return for SSR/test contexts
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') {
    return;
  }

  let deletionEventDetail: { redirectTo: string; handled: boolean } | null = null;

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

    case 'PROJECT_DELETED':
      toast.error('Project Deleted', {
        description: 'This project has been deleted and is no longer available.',
        duration: 4000,
      });

      deletionEventDetail = {
        redirectTo: error.redirectTo || '/dashboard',
        handled: false,
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('project:deleted', { detail: deletionEventDetail })
        );
      }
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

  // Handle redirect if needed
  if (error.shouldRedirect && error.redirectTo && typeof window !== 'undefined') {
    setTimeout(() => {
      if (!deletionEventDetail || !deletionEventDetail.handled) {
        window.location.href = error.redirectTo!;
      }
    }, 1500); // Small delay to let user see the toast
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
    
    // Check if this is a permission error or project deletion error with detailed info
    if (errorData.errorType && (errorData.shouldRefreshPermissions !== undefined || errorData.shouldRedirect !== undefined)) {
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
         ['NO_ACCESS', 'PERMISSION_REVOKED', 'INVALID_PROJECT', 'PROJECT_DELETED'].includes(error.errorType);
}

/**
 * Parse API error response and handle special error types
 * Returns whether the error was handled (toast shown, redirect triggered)
 */
export async function handleApiError(
  response: Response,
  onPermissionRefresh?: () => void
): Promise<{ handled: boolean; errorMessage: string }> {
  try {
    const errorData = await response.json();

    // Check if this is a structured error response with special handling
    if (isPermissionError(errorData)) {
      // Only handle permission errors in browser context
      if (typeof window !== 'undefined') {
        handlePermissionError(errorData as PermissionErrorResponse, onPermissionRefresh);
        return { handled: true, errorMessage: errorData.error };
      } else {
        // On server, return unhandled to avoid toast/redirect attempts
        return { handled: false, errorMessage: errorData.error || 'An error occurred' };
      }
    }

    // Return unhandled error
    return { handled: false, errorMessage: errorData.error || 'An error occurred' };
  } catch {
    // Fallback if response is not JSON
    return { handled: false, errorMessage: response.statusText || 'An error occurred' };
  }
} 