import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Loader2,  // For loading states in Dialog buttons and main component loading
  Edit,     // For Edit Project Dialog trigger & icon
  Trash2,   // For Delete Project Dialog
  Plus,     // For "Create New Task" button
  UserPlus, // For "Add Team Member" button
  CalendarIcon, // For Date Picker in Edit Dialog
  Icon,     // For RoleDisplayInfo icon type
} from 'lucide-react';
// CreateTaskForm is used.
import { CreateTaskForm } from '../../../../project/CreateTaskForm'; // Corrected path
import { toast } from 'sonner'; // For notifications
import { format } from 'date-fns'; // For formatting date in Edit Dialog
// isAfter is not directly used, CalendarComponent handles date disabling.
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // For Date Picker
import { Calendar as CalendarComponent } from '@/components/ui/calendar'; // For Date Picker
import { cn } from '@/lib/utils'; // For Popover button styling
import type { Project, Member, Task, RoleDisplayInfo } from '../../../types'; // Adjusted path

// Type Definitions are now imported from ../../../types

interface ProjectViewLeaderProps {
  project: Project;
  projectId: string;
  fetchProjectData: () => Promise<void>;
  handleTaskCreated: () => void;
  setActiveTab: (tab: string) => void;
  canCreateTasks: boolean;
  canAddMembers: boolean;
  tasks: Task[]; // Added tasks prop
  roleDisplay: RoleDisplayInfo; // Added roleDisplay prop
}

export const ProjectViewLeader: React.FC<ProjectViewLeaderProps> = ({
  project,
  projectId,
  fetchProjectData,
  handleTaskCreated,
  setActiveTab,
  canCreateTasks,
  canAddMembers,
  tasks, // Consuming tasks prop (e.g., for a stat)
  roleDisplay, // Consuming roleDisplay (e.g., for a label)
}) => {
  // Edit project dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: project.name,
    description: project.description || '',
    deadline: project.deadline ? new Date(project.deadline) : undefined
  });

  // Delete project dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleEditProject = async () => {
    if (!editFormData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsEditLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          description: editFormData.description.trim() || null,
          deadline: editFormData.deadline ? editFormData.deadline.toISOString() : null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      toast.success('Project updated successfully!');
      setIsEditDialogOpen(false);
      fetchProjectData(); // Refresh project data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      toast.success('Project deleted successfully!');
      // Redirect to dashboard or projects list
      // This might need to be handled by the parent or a router service
      window.location.href = '/dashboard';
    } catch (error: any)      {
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const openEditDialog = () => {
    setEditFormData({
      name: project.name,
      description: project.description || '',
      deadline: project.deadline ? new Date(project.deadline) : undefined
    });
    setIsEditDialogOpen(true);
  };

  return (
    <>
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
                    onTaskCreated={handleTaskCreated} // Ensure this prop name matches what CreateTaskForm expects
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
                    onClick={() => setActiveTab('members')}
                  >
                    <UserPlus className="h-4 w-4 mr-2 text-[#008080]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Add Team Member</span>
                  </div>
                )}
                {/* Example of using tasks prop: */}
                <div className="text-sm text-gray-500 dark:text-gray-400 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  Total tasks in project: {tasks.length}
                </div>
              </div>
            </div>

            {/* Project Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Project Settings (Role: {roleDisplay.label})</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Edit className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Edit Project Details</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">Delete Project</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#008080]" />
              Edit Project Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update your project information. All fields are optional except the project name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name-leader" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Name *
              </Label>
              <Input
                id="edit-name-leader" // Changed id to avoid conflict if main form is still rendered elsewhere
                type="text"
                placeholder="Enter project name..."
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
                disabled={isEditLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description-leader" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="edit-description-leader" // Changed id
                placeholder="Describe your project..."
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] min-h-[80px] resize-none"
                disabled={isEditLoading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Deadline
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:border-[#008080] dark:hover:border-[#00FFFF]",
                      !editFormData.deadline && "text-gray-500 dark:text-gray-400"
                    )}
                    disabled={isEditLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editFormData.deadline ? format(editFormData.deadline, "PPP") : "Select deadline (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={editFormData.deadline}
                    onSelect={(date) => setEditFormData(prev => ({ ...prev, deadline: date }))}
                    disabled={(date) => date < new Date()} // Ensure date is not in the past
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isEditLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditProject}
              disabled={isEditLoading || !editFormData.name.trim()}
              className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
            >
              {isEditLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete &quot;{project?.name}&quot;? This action cannot be undone and will permanently delete all project data, tasks, and member associations.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleteLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteProject}
              disabled={isDeleteLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
