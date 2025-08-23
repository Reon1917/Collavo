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
        className: "bg-secondary text-secondary-foreground"
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
        className: "bg-primary hover:bg-primary/90 text-primary-foreground"
      };
    }
    return {
      label: 'Team Member',
      icon: 'User',
      className: "bg-secondary text-secondary-foreground"
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