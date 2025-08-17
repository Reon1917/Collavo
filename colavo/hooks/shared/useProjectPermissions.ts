import { Project } from './useProjectData';

export function useProjectPermissions(project: Project | null) {
  if (!project) {
    return {
      canAddMembers: false,
      canCreateTasks: false,
      canManagePermissions: false,
      isLeader: false,
      userRole: null,
      roleDisplay: {
        label: 'Team Member',
        icon: 'User',
        className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      }
    };
  }

  const canAddMembers = project.userPermissions.includes('addMember');
  const canCreateTasks = project.userPermissions.includes('createTask');
  const canManagePermissions = project.isLeader;
  const isLeader = project.isLeader;

  const getUserRoleDisplay = () => {
    if (project.isLeader) {
      return {
        label: 'Project Leader',
        icon: 'Crown',
        className: "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
      };
    }
    return {
      label: 'Team Member',
      icon: 'User',
      className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    };
  };

  return {
    canAddMembers,
    canCreateTasks,
    canManagePermissions,
    isLeader,
    userRole: project.userRole,
    roleDisplay: getUserRoleDisplay()
  };
} 