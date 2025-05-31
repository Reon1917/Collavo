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
        project: null
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
        project: null
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
        project: projectData
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
        project: projectData
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
 * Check if user has a specific permission for a project
 */
export async function hasPermission(userId: string, projectId: string, permission: string): Promise<boolean> {
  const access = await checkProjectAccess(projectId, userId);
  return access.hasAccess && access.permissions.includes(permission);
}

/**
 * Require specific permission or throw error
 */
export async function requirePermission(userId: string, projectId: string, permission: string): Promise<void> {
  const hasAccess = await hasPermission(userId, projectId, permission);
  if (!hasAccess) {
    throw new Error(`Insufficient permissions: ${permission} required`);
  }
}

/**
 * Require project access or throw error
 */
export async function requireProjectAccess(userId: string, projectId: string): Promise<ProjectAccess> {
  const access = await checkProjectAccess(projectId, userId);
  if (!access.hasAccess) {
    throw new Error('Project not found or access denied');
  }
  return access;
}

/**
 * Require leader role or throw error
 */
export async function requireLeaderRole(userId: string, projectId: string): Promise<ProjectAccess> {
  const access = await checkProjectAccess(projectId, userId);
  if (!access.hasAccess) {
    throw new Error('Project not found or access denied');
  }
  if (!access.isLeader) {
    throw new Error('Leader role required');
  }
  return access;
} 