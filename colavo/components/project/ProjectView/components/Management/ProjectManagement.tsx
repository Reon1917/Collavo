"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  UserPlus, 
  Edit, 
  Trash2
} from 'lucide-react';
import { CreateTaskForm } from '../../../shared/forms/CreateTask';
import { Project } from '@/types/project';

interface ProjectManagementProps {
  project: Project;
  projectId: string;
  canCreateTasks: boolean;
  canAddMembers: boolean;
  onTaskCreated: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onNavigateToMembers: () => void;
}

export function ProjectManagement({
  project,
  projectId,
  canCreateTasks,
  canAddMembers,
  onTaskCreated,
  onEditProject,
  onDeleteProject,
  onNavigateToMembers
}: ProjectManagementProps) {
  if (!project.isLeader) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Project Management</CardTitle>
        <CardDescription>
          Manage your project settings and team. Only project leaders can access these actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Quick Actions</h4>
            <div className="space-y-2">
              {canCreateTasks && (
                <CreateTaskForm 
                  projectId={projectId} 
                  onTaskCreated={onTaskCreated}
                  members={project.members}
                  trigger={
                    <div className="flex items-center justify-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <Plus className="h-4 w-4 mr-2 text-[#008080]" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Create New Task</span>
                    </div>
                  }
                />
              )}
              {canAddMembers && (
                <div 
                  className="flex items-center justify-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={onNavigateToMembers}
                >
                  <UserPlus className="h-4 w-4 mr-2 text-[#008080]" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Add Team Member</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Project Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Project Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Edit className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Edit Project Details</span>
                </div>
                <Button variant="outline" size="sm" onClick={onEditProject}>
                  Edit
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">Delete Project</span>
                </div>
                <Button variant="destructive" size="sm" onClick={onDeleteProject}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 