"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Crown, 
  User, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm';
import { CreateTaskForm } from '@/components/project/CreateTaskForm';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
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

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch project details
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        throw new Error('Failed to fetch project details');
      }
      const projectData = await projectResponse.json();
      setProject(projectData);

      // Fetch tasks
      const tasksResponse = await fetch(`/api/projects/${projectId}/tasks`);
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await tasksResponse.json();
      setTasks(tasksData);

    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

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
        <p className="text-gray-600 dark:text-gray-400">The project you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const canAddMembers = project.userPermissions.includes('addMember') || project.isLeader;
  const canCreateTasks = project.userPermissions.includes('createTask') || project.isLeader;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200/60 dark:border-gray-700 shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {project.name}
            </h1>
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
          <Badge 
            variant={project.isLeader ? "default" : "secondary"}
            className={project.isLeader 
              ? "bg-[#008080] hover:bg-[#006666] text-white" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }
          >
            {project.isLeader ? (
              <>
                <Crown className="h-3 w-3 mr-1" />
                Leader
              </>
            ) : (
              <>
                <User className="h-3 w-3 mr-1" />
                Member
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="members">Members ({project.members.length})</TabsTrigger>
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
                  <span className="text-gray-600 dark:text-gray-400">Completed Sub-tasks</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tasks.reduce((acc, task) => acc + task.subTasks.filter(st => st.status === 'completed').length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Team Members</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{project.members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#008080]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No activity yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
            {canCreateTasks && (
              <CreateTaskForm 
                projectId={projectId} 
                onTaskCreated={handleTaskCreated}
                members={project.members}
              />
            )}
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first task.
                </p>
                {canCreateTasks && (
                  <CreateTaskForm 
                    projectId={projectId} 
                    onTaskCreated={handleTaskCreated}
                    members={project.members}
                    trigger={
                      <Button className="bg-[#008080] hover:bg-[#006666] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Task
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Team Members</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Members List */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Current Members</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  All project team members and their roles
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
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add Member Form */}
            {canAddMembers && (
              <AddMemberForm 
                projectId={projectId} 
                onMemberAdded={handleMemberAdded} 
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  const totalSubTasks = task.subTasks.length;

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {task.title}
            </CardTitle>
            {task.description && (
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {task.description}
              </CardDescription>
            )}
          </div>
          <Badge className={getImportanceColor(task.importanceLevel)}>
            {task.importanceLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {completedSubTasks}/{totalSubTasks} sub-tasks completed
            </span>
          </div>
          
          {totalSubTasks > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#008080] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(completedSubTasks / totalSubTasks) * 100}%` }}
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Created by {task.creatorName}</span>
            {task.deadline && (
              <span>Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 