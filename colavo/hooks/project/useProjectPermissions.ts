import { Crown, User } from 'lucide-react';

interface Project {
  isLeader: boolean;
  userPermissions: string[];
}

interface RoleDisplay {
  label: string;
  icon: typeof Crown | typeof User;
  className: string;
}

interface UseProjectPermissionsReturn {
  canAddMembers: boolean;
  canCreateTasks: boolean;
  canManagePermissions: boolean;
  getUserRoleDisplay: () => RoleDisplay;
}

export function useProjectPermissions(project: Project | null): UseProjectPermissionsReturn {
  const canAddMembers = project?.userPermissions.includes('addMember') ?? false;
  const canCreateTasks = project?.userPermissions.includes('createTask') ?? false;
  const canManagePermissions = project?.isLeader ?? false;

  const getUserRoleDisplay = (): RoleDisplay => {
    if (project?.isLeader) {
      return {
        label: 'Project Leader',
        icon: Crown,
        className: "bg-[#008080] hover:bg-[#006666] text-white"
      };
    }
    return {
      label: 'Team Member',
      icon: User,
      className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    };
  };

  return {
    canAddMembers,
    canCreateTasks,
    canManagePermissions,
    getUserRoleDisplay,
  };
} 