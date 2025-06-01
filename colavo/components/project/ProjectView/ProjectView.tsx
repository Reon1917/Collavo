"use client";

import { useState, useEffect, useCallback } from 'react';
// Removed duplicate import of { useState, useEffect, useCallback }
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Used for Task empty state & Member list
import { Button } from '@/components/ui/button'; // Used in Member list
import { Badge } from '@/components/ui/badge'; // Used in Project Header & Member list
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Used in Member list
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Input, Textarea, Label, Dialog and related icons (Edit, Trash2) are moved to ProjectViewLeader
// Popover, CalendarComponent, cn are moved to ProjectViewLeader
import {
  Calendar, // Used in Project Header and TaskCard (which is external now, but was in this file)
  Users,    // Used in Project Header
  Crown,    // Used in Project Header & roleDisplay
  User,     // Used in roleDisplay & TaskCard (external)
  Loader2,  // Main loading spinner
  Settings, // Used in Members tab for managing permissions
  CheckSquare, // Used in Tasks tab (empty state icon)
  Plus,     // Used in CreateTaskForm trigger
  UserPlus, // Icon for AddMemberForm trigger (though AddMemberForm is separate)
  // CalendarIcon is used in ProjectViewLeader for date picker
} from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm'; // Used in Members tab
import { CreateTaskForm } from '@/components/project/CreateTaskForm'; // Used in Tasks tab
import { toast } from 'sonner';
import { format } from 'date-fns'; // formatDistanceToNow, isAfter were for TaskCard
import { formatInitials } from '@/utils/format'; // Used in Member list
import { ProjectViewLeader } from './leader/ProjectViewLeader';
import { ProjectViewMember } from './member/ProjectViewMember';
import type { Project, Member, Task, SubTask, RoleDisplayInfo } from '../types'; // Adjusted path

interface ProjectViewProps {
  projectId: string;
}

// --- Interface Definitions are now imported from ../types ---

export function ProjectView({ projectId }: ProjectViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  // tasks definition remains as it's used by Tasks tab and passed to children
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit/Delete project dialog states and handlers are moved to ProjectViewLeader.tsx

  const fetchProjectData = useCallback(async () => {
    setIsLoading(true);
    // Resetting states that might be in ProjectViewLeader upon new fetch
    // This is a placeholder, actual state management might need context or prop drilling for reset
    // if setIsEditDialogOpen etc. were passed down and needed reset from parent.
    // For now, they are self-contained in ProjectViewLeader.

    try {
      // Fetch project details and tasks in parallel
      const [projectResponse, tasksResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/tasks`)
      ]);

      if (!projectResponse.ok) {
        throw new Error('Failed to fetch project data');
      }

      const projectData = await projectResponse.json();
      setProject(projectData);

      // Edit form data initialization is now in ProjectViewLeader's useEffect or openEditDialog

      // Tasks response might fail if no tasks exist, that's okay
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } else {
        setTasks([]);
      }
    } catch {
      toast.error('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleMemberAdded = () => {
    fetchProjectData(); // Refresh project data
  };

  const handleTaskCreated = () => {
    fetchProjectData(); // Refresh project data
  };

  // handleEditProject, handleDeleteProject, openEditDialog are moved to ProjectViewLeader

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project not found</h2>
        <p className="text-gray-600 dark:text-gray-400">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
      </div>
    );
  }

  // Role-based permission checks
  const canAddMembers = project.userPermissions.includes('addMember');
  const canCreateTasks = project.userPermissions.includes('createTask');
  // const canManagePermissions = project.isLeader; // This variable was unused

  // Get current user's role display
  const getUserRoleDisplay = () => {
    if (project.isLeader) {
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

  const roleDisplay = getUserRoleDisplay();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Project Header */}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1.5 rounded-xl shadow-sm">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#008080]/20 data-[state=active]:font-semibold dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-[#00FFFF] dark:data-[state=active]:border-[#00FFFF]/30 hover:bg-white/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 data-[state=inactive]:hover:text-gray-800 dark:data-[state=inactive]:hover:text-gray-200 transition-all duration-300 rounded-lg px-4 py-2.5 font-medium relative overflow-hidden data-[state=active]:scale-[1.02]"
          >
            <span className="relative z-10">Overview</span>
            {activeTab === 'overview' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#008080]/5 to-[#008080]/10 dark:from-[#00FFFF]/5 dark:to-[#00FFFF]/10" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#008080]/20 data-[state=active]:font-semibold dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-[#00FFFF] dark:data-[state=active]:border-[#00FFFF]/30 hover:bg-white/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 data-[state=inactive]:hover:text-gray-800 dark:data-[state=inactive]:hover:text-gray-200 transition-all duration-300 rounded-lg px-4 py-2.5 font-medium relative overflow-hidden data-[state=active]:scale-[1.02]"
          >
            <span className="relative z-10">Tasks ({tasks.length})</span>
            {activeTab === 'tasks' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#008080]/5 to-[#008080]/10 dark:from-[#00FFFF]/5 dark:to-[#00FFFF]/10" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#008080]/20 data-[state=active]:font-semibold dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-[#00FFFF] dark:data-[state=active]:border-[#00FFFF]/30 hover:bg-white/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 data-[state=inactive]:hover:text-gray-800 dark:data-[state=inactive]:hover:text-gray-200 transition-all duration-300 rounded-lg px-4 py-2.5 font-medium relative overflow-hidden data-[state=active]:scale-[1.02]"
          >
            <span className="relative z-10">Members ({project.members.length})</span>
            {activeTab === 'members' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#008080]/5 to-[#008080]/10 dark:from-[#00FFFF]/5 dark:to-[#00FFFF]/10" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* General project info cards (stats, permissions) are now in ProjectViewMember */}
          {/* Leader-specific management card is in ProjectViewLeader */}

          {project && project.isLeader ? (
            <ProjectViewLeader
              project={project}
              projectId={projectId}
              fetchProjectData={fetchProjectData}
              handleTaskCreated={handleTaskCreated} // Renamed from onTaskCreated for consistency
              setActiveTab={setActiveTab}
              canCreateTasks={canCreateTasks}
              canAddMembers={canAddMembers}
              tasks={tasks} // Pass tasks for potential stats display in leader view
              roleDisplay={roleDisplay} // Pass roleDisplay for potential use in leader view
            />
          ) : project ? (
            <ProjectViewMember
              project={project}
              tasks={tasks}
              roleDisplay={roleDisplay}
            />
          ) : null}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Tasks</h2>
            {canCreateTasks && (
              <CreateTaskForm
                projectId={projectId}
                onTaskCreated={handleTaskCreated}
                members={project.members}
                trigger={
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white rounded-md font-medium transition-colors cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Create Task
                  </div>
                }
              />
            )}
          </div>

          {tasks.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
              <CardContent className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {canCreateTasks
                    ? "Get started by creating your first task."
                    : "Tasks will appear here once they're created."
                  }
                </p>
                {canCreateTasks && (
                  <CreateTaskForm
                    projectId={projectId}
                    onTaskCreated={handleTaskCreated}
                    members={project.members}
                    trigger={
                      <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white rounded-md font-medium transition-colors cursor-pointer">
                        <Plus className="h-4 w-4" />
                        Create Task
                      </div>
                    }
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* tasks.map to render TaskCard is removed. TasksView will handle this. */}
              {/* For now, showing a placeholder if tasks exist or empty state */}
              {tasks.length > 0 ? (
                 <div className="text-center text-gray-500 dark:text-gray-400">Task rendering will be handled by TasksView.tsx</div>
              ) : (
                <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
                  <CardContent className="text-center py-12">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {canCreateTasks
                        ? "Get started by creating your first task."
                        : "Tasks will appear here once they're created."
                      }
                    </p>
                    {canCreateTasks && (
                      <CreateTaskForm
                        projectId={projectId}
                        onTaskCreated={handleTaskCreated}
                        members={project.members}
                        trigger={
                          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white rounded-md font-medium transition-colors cursor-pointer">
                            <Plus className="h-4 w-4" />
                            Create Task
                          </div>
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
          </div>

          {/* Add Member Form for Leaders */}
          {canAddMembers && (
            <AddMemberForm
              projectId={projectId}
              onMemberAdded={handleMemberAdded}
            />
          )}

          <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Project Team</CardTitle>
              <CardDescription>
                {project.members.length} member{project.members.length !== 1 ? 's' : ''} in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.userImage || ''} alt={member.userName} />
                      <AvatarFallback className="bg-[#008080] text-white text-sm">
                        {formatInitials(member.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.userName}
                          {member.userId === project.currentUserId && (
                            <span className="text-xs text-gray-500 ml-1">(You)</span>
                          )}
                        </p>
                        <Badge
                          variant={member.role === 'leader' ? "default" : "secondary"}
                          className={member.role === 'leader'
                            ? "bg-[#008080] hover:bg-[#006666] text-white text-xs"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs"
                          }
                        >
                          {member.role === 'leader' ? (
                            <>
                              <Crown className="h-2 w-2 mr-1" />
                              Leader
                            </>
                          ) : (
                            'Member'
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.userEmail}
                      </p>
                      {member.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.permissions.slice(0, 3).map((permission) => (
                            <span
                              key={permission}
                              className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded"
                            >
                              {permission}
                            </span>
                          ))}
                          {member.permissions.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{member.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {canManagePermissions && member.userId !== project.currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Project Dialog and Delete Project Confirmation Dialog are now part of ProjectViewLeader */}
    </div>
  );
}

// TaskCard component was fully removed. The map was also removed.
// The empty state for tasks was kept as it was already there.
// A placeholder message is added if tasks exist, to clarify TasksView will handle rendering.