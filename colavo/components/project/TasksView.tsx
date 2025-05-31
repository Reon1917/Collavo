"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  Circle, 
  PlayCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  FileText,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { CreateTaskForm } from '@/components/project/CreateTaskForm';
import { CreateSubTaskForm } from '@/components/project/CreateSubTaskForm';
import { SubTaskDetailsDialog } from '@/components/project/SubTaskDetailsDialog';
import { toast } from 'sonner';
import { formatDistanceToNow, format, isAfter } from 'date-fns';
import { formatInitials } from '@/utils/format';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TasksViewProps {
  projectId: string;
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

interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  members: Member[];
  userPermissions: string[];
  isLeader: boolean;
  currentUserId?: string;
}

interface Member {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  userName: string;
  userEmail: string;
  userImage: string | null;
}

export function TasksView({ projectId }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImportance, setFilterImportance] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
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
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = () => {
    fetchData(); // Refresh tasks
  };

  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getTaskProgress = (task: Task) => {
    if (task.subTasks.length === 0) return 0;
    const completed = task.subTasks.filter(st => st.status === 'completed').length;
    return (completed / task.subTasks.length) * 100;
  };

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return isAfter(new Date(), new Date(deadline));
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesImportance = filterImportance === 'all' || task.importanceLevel === filterImportance;
      
      let matchesStatus = true;
      if (filterStatus === 'completed') {
        matchesStatus = task.subTasks.length > 0 && task.subTasks.every(st => st.status === 'completed');
      } else if (filterStatus === 'in_progress') {
        matchesStatus = task.subTasks.some(st => st.status === 'in_progress');
      } else if (filterStatus === 'pending') {
        matchesStatus = task.subTasks.length === 0 || task.subTasks.some(st => st.status === 'pending');
      }

      return matchesSearch && matchesImportance && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'importance':
          const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return importanceOrder[b.importanceLevel] - importanceOrder[a.importanceLevel];
        case 'progress':
          return getTaskProgress(b) - getTaskProgress(a);
        default: // created
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

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
        <p className="text-gray-600 dark:text-gray-400">Unable to load project details.</p>
      </div>
    );
  }

  const canCreateTasks = project.userPermissions.includes('createTask') || project.isLeader;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track project tasks and sub-tasks
          </p>
        </div>
        {canCreateTasks && (
          <CreateTaskForm 
            projectId={projectId} 
            onTaskCreated={handleTaskCreated}
            members={project.members}
          />
        )}
      </div>

      {/* Filters and Search */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Importance Filter */}
            <Select value={filterImportance} onValueChange={setFilterImportance}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Importance</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="importance">Importance</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {filteredAndSortedTasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              project={project}
              onUpdate={handleTaskCreated}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tasks.length === 0 
                ? 'Get started by creating your first task.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {canCreateTasks && tasks.length === 0 && (
              <CreateTaskForm 
                projectId={projectId} 
                onTaskCreated={handleTaskCreated}
                members={project.members}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskCard({ task, project, onUpdate }: { 
  task: Task; 
  project: Project;
  onUpdate: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const progress = task.subTasks.length > 0 
    ? (task.subTasks.filter(st => st.status === 'completed').length / task.subTasks.length) * 100 
    : 0;

  const isOverdue = task.deadline && isAfter(new Date(), new Date(task.deadline));
  
  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const handleEditTask = () => {
    // TODO: Implement task editing functionality
    toast.info('Task editing functionality coming soon!');
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${project.id}/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      toast.success('Task deleted successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if user can edit/delete tasks
  const canModifyTask = project.isLeader || project.userPermissions.includes('updateTask') || task.createdBy === project.currentUserId;

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`text-xs font-medium border ${getImportanceColor(task.importanceLevel)}`}
              >
                {task.importanceLevel.charAt(0).toUpperCase() + task.importanceLevel.slice(1)}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {task.title}
            </CardTitle>
            {task.description && (
              <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {task.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="h-8 w-8 p-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canModifyTask && (
                <DropdownMenuItem onClick={handleEditTask}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
              )}
              {canModifyTask && (
                <DropdownMenuItem 
                  onClick={handleDeleteTask}
                  className="text-red-600 focus:text-red-600"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              )}
              {!canModifyTask && (
                <DropdownMenuItem disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  View Only
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress */}
        {task.subTasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {task.subTasks.filter(st => st.status === 'completed').length} of {task.subTasks.length} subtasks completed
            </p>
          </div>
        )}

        {/* Sub-tasks preview */}
        {task.subTasks.length > 0 ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Sub-tasks ({task.subTasks.length})
              </h4>
              <CreateSubTaskForm 
                projectId={project.id}
                mainTaskId={task.id}
                mainTaskDeadline={task.deadline}
                projectDeadline={project.deadline}
                onSubTaskCreated={onUpdate}
                members={project.members}
              />
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {task.subTasks.slice(0, 3).map((subTask) => (
                <SubTaskDetailsDialog
                  key={subTask.id}
                  subTask={subTask}
                  currentUserId={project.currentUserId || ''}
                  isProjectLeader={project.isLeader}
                  projectId={project.id}
                  mainTaskId={task.id}
                  mainTaskDeadline={task.deadline}
                  projectDeadline={project.deadline}
                  members={project.members}
                  onSubTaskUpdated={onUpdate}
                  trigger={
                    <div className="flex items-center justify-between gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`flex-1 ${subTask.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {subTask.title}
                        </span>
                        {subTask.assignedUserName && (
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-[#008080] text-white text-xs">
                              {formatInitials(subTask.assignedUserName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(subTask.status)}`}
                      >
                        {getStatusLabel(subTask.status)}
                      </Badge>
                    </div>
                  }
                />
              ))}
              {task.subTasks.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  +{task.subTasks.length - 3} more subtasks
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Sub-tasks (0)
              </h4>
              <CreateSubTaskForm 
                projectId={project.id}
                mainTaskId={task.id}
                mainTaskDeadline={task.deadline}
                projectDeadline={project.deadline}
                onSubTaskCreated={onUpdate}
                members={project.members}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              No subtasks yet. Add the first one to get started.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.creatorName}</span>
            </div>
            {task.deadline && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.deadline), 'MMM dd')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 