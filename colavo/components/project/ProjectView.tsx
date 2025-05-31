"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Crown, 
  User, 
  Plus, 
  FileText,
  Loader2,
  Edit,
  CheckCircle,
  Trash2,
  Settings,
  CheckSquare
} from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm';
import { CreateTaskForm } from '@/components/project/CreateTaskForm';
import { toast } from 'sonner';
import { formatDistanceToNow, format, isAfter } from 'date-fns';
import { formatInitials } from '@/utils/format';

interface ProjectViewProps {
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  members: Member[];
  userPermissions: string[];
  isLeader: boolean;
  userRole: 'leader' | 'member' | null;
  currentUserId: string;
}

interface Member {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  permissions: string[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  creatorEmail: string;
  subTasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  note: string | null;
  deadline: string | null;
  assignedId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchProjectData = useCallback(async () => {
    setIsLoading(true);
    
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
  const canEditProject = project.isLeader; // Only leaders can edit project details
  const canDeleteProject = project.isLeader; // Only leaders can delete projects
  const canManagePermissions = project.isLeader; // Only leaders can manage member permissions

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
              {canEditProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
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
            {canDeleteProject && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Project
              </Button>
            )}
          </div>
        </div>

        {/* Role-specific action buttons */}
        {(canAddMembers || canCreateTasks) && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {canCreateTasks && (
                <CreateTaskForm 
                  projectId={projectId} 
                  onTaskCreated={handleTaskCreated}
                  members={project.members}
                />
              )}
              {canAddMembers && (
                <AddMemberForm 
                  projectId={projectId} 
                  onMemberAdded={handleMemberAdded}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="members">Members ({project.members.length})</TabsTrigger>
          {project.isLeader && (
            <TabsTrigger value="settings">Project Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
            {canAddMembers && (
              <AddMemberForm 
                projectId={projectId} 
                onMemberAdded={handleMemberAdded}
              />
            )}
          </div>
          
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

        {/* Project Settings Tab (Leader Only) */}
        {project.isLeader && (
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Settings</h2>
            
            <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Project Management</CardTitle>
                <CardDescription>
                  Manage project settings and permissions. Only project leaders can access these settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Edit Project Details</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update project name, description, and deadline</p>
                  </div>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Delete Project</h4>
                    <p className="text-sm text-red-600 dark:text-red-400">Permanently delete this project and all its data</p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  const totalSubTasks = task.subTasks.length;
  const progress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant="outline" 
                className={`text-xs font-medium border ${getImportanceColor(task.importanceLevel)}`}
              >
                {task.importanceLevel.charAt(0).toUpperCase() + task.importanceLevel.slice(1)}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {task.title}
            </CardTitle>
            {task.description && (
              <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {task.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress Section */}
          {totalSubTasks > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-[#008080] h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {completedSubTasks} of {totalSubTasks} subtasks completed
              </p>
            </div>
          )}

          {/* Subtasks Preview */}
          {totalSubTasks > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Subtasks</h4>
              <div className="space-y-2">
                {task.subTasks.slice(0, 2).map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                      {subtask.title}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ml-2 ${
                        subtask.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : subtask.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}
                    >
                      {subtask.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {totalSubTasks > 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                    +{totalSubTasks - 2} more subtasks
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Task Metadata */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Created by {task.creatorName}</span>
              </div>
              {task.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span className={isAfter(new Date(), new Date(task.deadline)) ? 'text-red-500' : ''}>
                    Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 