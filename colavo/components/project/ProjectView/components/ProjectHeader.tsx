"use client";

import { Badge } from '@/components/ui/badge';
import { Calendar, Crown, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Project } from '@/hooks/shared/useProjectData';

interface ProjectHeaderProps {
  project: Project;
  roleDisplay: {
    label: string;
    icon: string;
    className: string;
  };
}

export function ProjectHeader({ project, roleDisplay }: ProjectHeaderProps) {
  const IconComponent = roleDisplay?.icon === 'Crown' ? Crown : Users;

  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <Badge 
            variant={project.isLeader ? "default" : "secondary"}
            className={roleDisplay.className}
          >
            <IconComponent className="h-3 w-3 mr-1" />
            {roleDisplay.label}
          </Badge>
        </div>
        {project.description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4 max-w-3xl">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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
    </div>
  );
} 