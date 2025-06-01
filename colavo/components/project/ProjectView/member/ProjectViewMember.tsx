import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
// Icon as LucideIcon is not needed if RoleDisplayInfo uses the imported LucideIcon type from types.ts
import type { Project, Member, Task, RoleDisplayInfo } from '../../../types'; // Adjusted path

// Type Definitions are now imported from ../../../types
// Note: The local minimal definitions for Member, Project, Task were removed.
// RoleDisplayInfo.icon will use the LucideIcon type from the imported RoleDisplayInfo.

interface ProjectViewMemberProps {
  project: Project;
  tasks: Task[];
  roleDisplay: RoleDisplayInfo;
}

export const ProjectViewMember: React.FC<ProjectViewMemberProps> = ({ project, tasks, roleDisplay }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Stats */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Project Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
            <span className="font-semibold text-gray-900 dark:text-white">{tasks.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Team Members</span>
            <span className="font-semibold text-gray-900 dark:text-white">{project.members.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Your Role</span>
            <span className="font-semibold text-gray-900 dark:text-white">{roleDisplay.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Permissions</span>
            <span className="font-semibold text-gray-900 dark:text-white">{project.userPermissions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Your Permissions */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Your Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {project.userPermissions.length > 0 ? (
              project.userPermissions.map((permission) => (
                <div key={permission} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No specific permissions assigned
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
