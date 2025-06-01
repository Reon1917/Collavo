"use client";

import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { Project } from '@/types/project';
import { useProjectPermissions } from '@/hooks/project/useProjectPermissions';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { getUserRoleDisplay } = useProjectPermissions(project);
  const roleDisplay = getUserRoleDisplay();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200/60 dark:border-gray-700 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
          </div>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span>Led by {project.leaderName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
            </div>
            {project.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due {format(new Date(project.deadline), 'PPP')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={project.isLeader ? "default" : "secondary"}
            className={roleDisplay.className}
          >
            <roleDisplay.icon className="h-3 w-3 mr-1" />
            {roleDisplay.label}
          </Badge>
        </div>
      </div>
    </div>
  );
} 