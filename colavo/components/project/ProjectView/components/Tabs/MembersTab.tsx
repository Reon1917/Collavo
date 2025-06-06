"use client";

import { MembersView } from '@/components/project/MembersView';
import { Project } from '@/hooks/shared/useProjectData';

interface MembersTabProps {
  project: Project;
  permissions: {
    canAddMembers: boolean;
    canManagePermissions: boolean;
  };
  onRefresh: () => void;
}

export function MembersTab({ project }: MembersTabProps) {
  return <MembersView projectId={project.id} />;
} 