import { db } from '@/db';
import { projects, members, permissions} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ProjectAccess {
  hasAccess: boolean;
  isLeader: boolean;
  isMember: boolean;
  role: 'leader' | 'member' | null;
  permissions: string[];
  project: {
    id: string;
    name: string;
    leaderId: string;
  } | null;
  errorType?: 'PROJECT_NOT_FOUND' | 'ACCESS_DENIED';
}

/**
 * Centralized function to check user's access to a project
 * Returns comprehensive access information including role and permissions
 */
export async function checkProjectAccess(projectId: string, userId: string): Promise<ProjectAccess> {
  try {
    // Get project details
    const project = await db
      .select({
        id: projects.id,
        name: projects.name,
        leaderId: projects.leaderId,
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project.length) {
      return {
        hasAccess: false,
        isLeader: false,
        isMember: false,
        role: null,
        permissions: [],
        project: null,
        errorType: 'PROJECT_NOT_FOUND'
      };
    }

    const projectData = project[0];
    if (!projectData) {
      return {
        hasAccess: false,
        isLeader: false,
        isMember: false,
        role: null,
        permissions: [],
        project: null,
        errorType: 'PROJECT_NOT_FOUND'
      };
    }

    const isLeader = projectData.leaderId === userId;

    // If user is leader, they have all access
    if (isLeader) {
      return {
        hasAccess: true,
        isLeader: true,
        isMember: true, // Leaders are also considered members
        role: 'leader',
        permissions: [
          'createTask', 'handleTask', 'updateTask', 'handleEvent',
          'handleFile', 'addMember', 'createEvent', 'viewFiles'
        ],
        project: projectData
      };
    }

    // Check if user is a member
    const memberRecord = await db
      .select({
        id: members.id,
        role: members.role,
      })
      .from(members)
      .where(and(
        eq(members.projectId, projectId),
        eq(members.userId, userId)
      ))
      .limit(1);

    if (!memberRecord.length) {
      return {
        hasAccess: false,
        isLeader: false,
        isMember: false,
        role: null,
        permissions: [],
        project: projectData,
        errorType: 'ACCESS_DENIED'
      };
    }

    const memberData = memberRecord[0];
    if (!memberData) {
      return {
        hasAccess: false,
        isLeader: false,
        isMember: false,
        role: null,
        permissions: [],
        project: projectData,
        errorType: 'ACCESS_DENIED'
      };
    }

    // Get member permissions
    const memberPermissions = await db
      .select({
        permission: permissions.permission,
        granted: permissions.granted
      })
      .from(permissions)
      .where(eq(permissions.memberId, memberData.id));

    const grantedPermissions = memberPermissions
      .filter(p => p.granted)
      .map(p => p.permission);

    return {
      hasAccess: true,
      isLeader: false,
      isMember: true,
      role: memberData.role,
      permissions: grantedPermissions,
      project: projectData
    };

  } catch {
    //console.error('Error checking project access:', error);
    return {
      hasAccess: false,
      isLeader: false,
      isMember: false,
      role: null,
      permissions: [],
      project: null
    };
  }
}

/**
 * Enhanced permission check with detailed error information
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  errorType?: 'NO_ACCESS' | 'PERMISSION_REVOKED' | 'INVALID_PROJECT';
  errorMessage?: string;
  requiredPermission?: string;
  currentPermissions?: string[];
}

/**
 * Enhanced permission check that returns detailed error information
 */
export async function checkPermissionDetailed(
  userId: string, 
  projectId: string, 
  permission: string
): Promise<PermissionCheckResult> {
  const access = await checkProjectAccess(projectId, userId);
  
  if (!access.hasAccess) {
    return {
      hasPermission: false,
      errorType: access.project ? 'NO_ACCESS' : 'INVALID_PROJECT',
      errorMessage: access.project ? 
        'You no longer have access to this project' : 
        'Project not found',
      requiredPermission: permission,
      currentPermissions: []
    };
  }
  
  const hasRequiredPermission = access.permissions.includes(permission);
  
  if (!hasRequiredPermission) {
    return {
      hasPermission: false,
      errorType: 'PERMISSION_REVOKED',
      errorMessage: `Your permission to ${permission} has been revoked`,
      requiredPermission: permission,
      currentPermissions: access.permissions
    };
  }
  
  return {
    hasPermission: true,
    currentPermissions: access.permissions
  };
}

/**
 * Check if user has a specific permission for a project
 */
export async function hasPermission(userId: string, projectId: string, permission: string): Promise<boolean> {
  const access = await checkProjectAccess(projectId, userId);
  return access.hasAccess && access.permissions.includes(permission);
}

/**
 * Require project access and throw error if access is denied
 * Used as a centralized access control for API routes
 */
export async function requireProjectAccess(userId: string, projectId: string): Promise<ProjectAccess> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess) {
    if (access.errorType === 'PROJECT_NOT_FOUND') {
      throw new Error('Project no longer exists or has been deleted');
    } else {
      throw new Error('Access denied - you are not a member of this project');
    }
  }

  return access;
}

/**
 * Create standardized permission error response for API routes
 */
export function createPermissionErrorResponse(result: PermissionCheckResult) {
  return {
    error: result.errorMessage,
    errorType: result.errorType,
    requiredPermission: result.requiredPermission,
    currentPermissions: result.currentPermissions || [],
    // Frontend can use this to trigger permission refresh
    shouldRefreshPermissions: result.errorType === 'PERMISSION_REVOKED'
  };
}

/**
 * Require leader role or throw error
 */
export async function requireLeaderRole(userId: string, projectId: string): Promise<ProjectAccess> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess) {
    if (access.errorType === 'PROJECT_NOT_FOUND') {
      throw new Error('Project no longer exists or has been deleted');
    } else {
      throw new Error('Access denied - you are not a member of this project');
    }
  }

  if (!access.isLeader) {
    throw new Error('Leader role required - only project leaders can perform this action');
  }

  return access;
}

/**
 * Lightweight project access check for high-frequency operations like presence updates
 * Only checks if user is a member, doesn't fetch permissions
 */
export async function checkBasicProjectAccess(projectId: string, userId: string): Promise<boolean> {
  try {
    // Single query to check membership - much faster than full checkProjectAccess
    const memberRecord = await db
      .select({ id: members.id })
      .from(members)
      .where(and(
        eq(members.projectId, projectId),
        eq(members.userId, userId)
      ))
      .limit(1);

    return memberRecord.length > 0;
  } catch {
    return false;
  }
} 