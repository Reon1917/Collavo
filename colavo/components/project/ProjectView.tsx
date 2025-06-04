"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  Users, 
  Crown, 
  User, 
  Loader2,
  Edit,
  CheckCircle,
  Trash2,
  Settings,
  CheckSquare,
  Plus,
  UserPlus,
  CalendarIcon
} from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm';
import { CreateTaskForm } from '@/components/project/CreateTaskForm';
import { toast } from 'sonner';
import { formatDistanceToNow, format, isAfter } from 'date-fns';
import { formatInitials } from '@/utils/format';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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
  
  // Edit project dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    deadline: undefined as Date | undefined
  });
  
  // Delete project dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

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

      // Set edit form data when project loads
      setEditFormData({
        name: projectData.name,
        description: projectData.description || '',
        deadline: projectData.deadline ? new Date(projectData.deadline) : undefined
      });

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
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const openEditDialog = () => {
    if (project) {
      setEditFormData({
        name: project.name,
        description: project.description || '',
        deadline: project.deadline ? new Date(project.deadline) : undefined
      });
    }
    setIsEditDialogOpen(true);
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
    <div className="min-h-screen space-y-6">
      {/* Project Header - Streamlined */}
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
              <roleDisplay.icon className="h-3 w-3 mr-1" />
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

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Row - Defined */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{tasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{project.members.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{project.userPermissions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Your Permissions</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {tasks.filter(t => t.subTasks.some(st => st.status === 'completed')).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasks in Progress</div>
            </div>
          </div>

          {/* Main Content - Wide Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Tasks Overview - Takes more space */}
            <div className="xl:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
                {tasks.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="text-sm text-[#008080] hover:text-[#006666] font-medium flex items-center gap-1"
                  >
                    View all {tasks.length} tasks →
                  </button>
                )}
              </div>
              
              {tasks.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {tasks.slice(0, 6).map((task) => (
                    <div key={task.id} className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">{task.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Created by {task.creatorName}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ml-2 ${task.importanceLevel === 'critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : task.importanceLevel === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' : task.importanceLevel === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'}`}
                        >
                          {task.importanceLevel}
                        </Badge>
                      </div>
                      
                      {/* Progress */}
                      {task.subTasks.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round((task.subTasks.filter(st => st.status === 'completed').length / task.subTasks.length) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-[#008080] h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${(task.subTasks.filter(st => st.status === 'completed').length / task.subTasks.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Subtasks Preview */}
                      {task.subTasks.length > 0 && (
                        <div className="space-y-1">
                          {task.subTasks.slice(0, 2).map((subtask) => (
                            <div key={subtask.id} className="flex items-center gap-2 text-xs">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                subtask.status === 'completed' ? 'bg-green-500' :
                                subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{subtask.title}</span>
                              {subtask.assignedUserName && (
                                <span className="text-gray-500 dark:text-gray-500 text-xs">
                                  {subtask.assignedUserName === project.currentUserId ? 'You' : subtask.assignedUserName}
                                </span>
                              )}
                            </div>
                          ))}
                          {task.subTasks.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              +{task.subTasks.length - 2} more subtasks
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {canCreateTasks 
                      ? "Get started by creating your first task."
                      : "Tasks will appear here once they're created."
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Side Panel - Compact */}
            <div className="space-y-4">
              {/* Your Permissions */}
              <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Your Access</h3>
                <div className="space-y-2">
                  {project.userPermissions.length > 0 ? (
                    project.userPermissions.slice(0, 4).map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
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
                  {project.userPermissions.length > 4 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      +{project.userPermissions.length - 4} more permissions
                    </p>
                  )}
                </div>
              </div>

              {/* Team Members Preview */}
              <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Team</h3>
                <div className="space-y-2">
                  {project.members.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.userImage || ''} alt={member.userName} />
                        <AvatarFallback className="bg-[#008080] text-white text-xs">
                          {formatInitials(member.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                          {member.userName}
                          {member.userId === project.currentUserId && (
                            <span className="text-xs text-gray-500 ml-1">(You)</span>
                          )}
                        </span>
                      </div>
                      {member.role === 'leader' && (
                        <Crown className="h-3 w-3 text-[#008080]" />
                      )}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <button 
                      onClick={() => setActiveTab('members')}
                      className="text-xs text-[#008080] hover:text-[#006666] font-medium"
                    >
                      +{project.members.length - 4} more members
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions for Leaders */}
          {project.isLeader && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Management</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Leader actions</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {canCreateTasks && (
                  <CreateTaskForm 
                    projectId={projectId} 
                    onTaskCreated={handleTaskCreated}
                    members={project.members}
                    trigger={
                      <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center">
                        <Plus className="h-6 w-6 mb-2 text-[#008080]" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Create Task</span>
                      </div>
                    }
                  />
                )}
                
                {canAddMembers && (
                  <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center"
                       onClick={() => setActiveTab('members')}>
                    <UserPlus className="h-6 w-6 mb-2 text-[#008080]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Add Member</span>
                  </div>
                )}
                
                <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center"
                     onClick={openEditDialog}>
                  <Edit className="h-6 w-6 mb-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Edit Project</span>
                </div>
                
                <div className="flex flex-col items-center p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors text-center"
                     onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-6 w-6 mb-2 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Delete Project</span>
                </div>
              </div>
            </div>
          )}
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
            <div className="text-center py-12 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {tasks.map((task) => (
                <CompactTaskCard key={task.id} task={task} />
              ))}
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
            <div className="mb-6">
              <AddMemberForm 
                projectId={projectId} 
                onMemberAdded={handleMemberAdded}
              />
            </div>
          )}
          
          {/* Compact Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {project.members.map((member) => (
              <div key={member.id} className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.userImage || ''} alt={member.userName} />
                    <AvatarFallback className="bg-[#008080] text-white text-xs">
                      {formatInitials(member.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.userName}
                      </p>
                      {member.role === 'leader' && (
                        <Crown className="h-3 w-3 text-[#008080] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {member.userEmail}
                    </p>
                  </div>
                </div>
                
                {/* Role and permissions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={member.role === 'leader' ? "default" : "secondary"}
                      className={`text-xs ${member.role === 'leader'
                        ? "bg-[#008080] text-white" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {member.role === 'leader' ? 'Leader' : 'Member'}
                    </Badge>
                    {member.userId === project.currentUserId && (
                      <span className="text-xs text-[#008080] font-medium">You</span>
                    )}
                  </div>
                  
                  {member.permissions.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {member.permissions.length} permission{member.permissions.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {canManagePermissions && member.userId !== project.currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-6 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Manage
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
              <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Name *
              </Label>
              <Input
                id="edit-name"
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
              <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="edit-description"
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
                    disabled={(date) => date < new Date()}
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
    </div>
  );
}

// Compact task card for maximum density
function CompactTaskCard({ task }: { task: Task }) {
  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  const totalSubTasks = task.subTasks.length;
  const progress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all h-full flex flex-col">
      {/* Header with importance indicator */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getImportanceColor(task.importanceLevel)}`} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
            {task.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {task.creatorName}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {totalSubTasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>{completedSubTasks}/{totalSubTasks}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-[#008080] h-1 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtasks preview - ultra compact */}
      {totalSubTasks > 0 && (
        <div className="flex-1 space-y-1">
          {task.subTasks.slice(0, 3).map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-1.5 text-xs">
              <div className={`w-1 h-1 rounded-full flex-shrink-0 ${
                subtask.status === 'completed' ? 'bg-green-500' :
                subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1 text-xs">
                {subtask.title}
              </span>
            </div>
          ))}
          {totalSubTasks > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
              +{totalSubTasks - 3}
            </p>
          )}
        </div>
      )}

      {/* Deadline if exists */}
      {task.deadline && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className={`${isAfter(new Date(), new Date(task.deadline)) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
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
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                        {subtask.title}
                      </span>
                      {subtask.assignedUserName && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Assigned to: {subtask.assignedUserName}
                        </span>
                      )}
                    </div>
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