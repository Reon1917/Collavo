"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  // Calendar, // Was for TaskCard/SubTaskItem
  // User, // Was for TaskCard/SubTaskItem
  Plus,
  Search,
  FileText,
  AlertCircle, // Used for "Limited Task View"
  // MoreVertical, Edit, Trash2 are specific to TaskCard
  Loader2 // Used for main loading state
} from 'lucide-react';
// formatDistanceToNow, isAfter were specific to TaskCard/SubTaskItem
// CreateSubTaskForm, EditTaskDialog, SubTaskDetailsDialog are used by TaskCard/SubTaskItem, not directly by TasksView shell
import { CreateTaskForm } from '../../project/CreateTaskForm'; // Corrected path: CreateTaskForm is in components/project/
import { toast } from 'sonner'; // Used for general notifications
// DropdownMenu components were specific to TaskCard
// Progress was specific to TaskCard
// TaskCard import is removed as it's now used by TasksViewLeader/Member
// import { TaskCard } from './TaskCard/TaskCard';
import { TasksViewLeader } from './leader/TasksViewLeader';
import { TasksViewMember } from './member/TasksViewMember';
import type { Project, Member, Task, SubTask } from '../types'; // Adjusted path

interface TasksViewProps {
  projectId: string;
}

// ----- Type Definitions are now imported from ../types -----

// Request cache logic can remain here as it's used by fetchProjectData and fetchTasksData
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

function getCachedRequest<T>(key: string): T | null {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  requestCache.delete(key);
  return null;
}

function setCachedRequest<T>(key: string, data: T): void {
  requestCache.set(key, { data, timestamp: Date.now() });
}
// End Request Cache Logic

export function TasksView({ projectId }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImportance, setFilterImportance] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');

  // Track ongoing requests to prevent duplicates
  const ongoingRequests = useRef(new Set<string>());

  const fetchProjectData = useCallback(async (): Promise<Project | null> => {
    const cacheKey = `project-${projectId}`;
    const cached = getCachedRequest<Project>(cacheKey);
    if (cached) return cached;

    if (ongoingRequests.current.has(cacheKey)) {
      // Wait for ongoing request
      return new Promise((resolve) => {
        const checkCache = () => {
          const result = getCachedRequest<Project>(cacheKey);
          if (result || !ongoingRequests.current.has(cacheKey)) {
            resolve(result);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    ongoingRequests.current.add(cacheKey);

    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found or access denied');
        }
        throw new Error('Failed to fetch project data');
      }

      const projectData = await response.json();
      setCachedRequest(cacheKey, projectData);
      return projectData;
    } finally {
      ongoingRequests.current.delete(cacheKey);
    }
  }, [projectId]);

  const fetchTasksData = useCallback(async (): Promise<Task[]> => {
    const cacheKey = `tasks-${projectId}`;
    const cached = getCachedRequest<Task[]>(cacheKey);
    if (cached) return cached;

    if (ongoingRequests.current.has(cacheKey)) {
      // Wait for ongoing request
      return new Promise((resolve) => {
        const checkCache = () => {
          const result = getCachedRequest<Task[]>(cacheKey);
          if (result || !ongoingRequests.current.has(cacheKey)) {
            resolve(result || []);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    ongoingRequests.current.add(cacheKey);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found or access denied');
        }
        throw new Error('Failed to fetch tasks');
      }

      const tasksData = await response.json();
      setCachedRequest(cacheKey, tasksData);
      return tasksData;
    } finally {
      ongoingRequests.current.delete(cacheKey);
    }
  }, [projectId]);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch project and tasks in parallel, using cache
      const [projectData, tasksData] = await Promise.all([
        fetchProjectData(),
        fetchTasksData()
      ]);

      if (projectData) {
        setProject(projectData);
      }
      setTasks(tasksData);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to load tasks');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjectData, fetchTasksData]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Optimistic task creation
  const handleTaskCreated = useCallback((newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    // Invalidate cache
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  // Optimistic task update
  const handleTaskUpdated = useCallback((updatedTask: Partial<Task> & { id: string }) => {
    setTasks(prev => prev.map(task =>
      task.id === updatedTask.id
        ? { ...task, ...updatedTask }
        : task
    ));
    // Invalidate cache
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  // Optimistic task deletion
  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    // Invalidate cache
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  // Optimistic subtask update
  const handleSubTaskUpdated = useCallback((taskId: string, updatedSubTask: Partial<SubTask> & { id: string }) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            subTasks: task.subTasks.map(subtask =>
              subtask.id === updatedSubTask.id
                ? { ...subtask, ...updatedSubTask }
                : subtask
            )
          }
        : task
    ));
    // Invalidate cache
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  // Optimistic subtask creation
  const handleSubTaskCreated = useCallback((taskId: string, newSubTask: SubTask) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, subTasks: [...task.subTasks, newSubTask] }
        : task
    ));
    // Invalidate cache
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  // Optimistic subtask deletion
  const handleSubTaskDeleted = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, subTasks: task.subTasks.filter(subtask => subtask.id !== subtaskId) }
        : task
    ));
    // Invalidate cache
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  const getTaskProgress = (task: Task) => {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
    return Math.round((completedSubTasks / task.subTasks.length) * 100);
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
        <p className="text-gray-600 dark:text-gray-400">Unable to load project details or you don&apos;t have access to this project.</p>
      </div>
    );
  }

  // Role-based permission checks
  const canCreateTasks = project.userPermissions.includes('createTask');
  // canViewAllTasks is crucial for deciding which sub-component to render
  // and for filtering tasks if a member cannot view all.
  const canViewAllTasks = project.isLeader || project.userPermissions.includes('viewFiles');

  // Get user's role display for the header badge
  const getUserRoleInfo = () => {
    if (project.isLeader) {
      return {
        label: 'Project Leader',
        description: 'You can see and manage all tasks in this project'
      };
    } else if (canViewAllTasks) {
      return {
        label: 'Team Member (Full Access)',
        description: 'You can see all tasks in this project'
      };
    } else {
      return {
        label: 'Team Member',
        description: 'You can only see tasks where you are assigned'
      };
    }
  };

  const roleInfo = getUserRoleInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <Badge
              variant={project.isLeader ? "default" : "secondary"}
              className={project.isLeader
                ? "bg-[#008080] hover:bg-[#006666] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }
            >
              {roleInfo.label}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {roleInfo.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Project: {project.name}
          </p>
        </div>
        {canCreateTasks && (
          <CreateTaskForm
            projectId={projectId}
            onTaskCreated={handleTaskCreated}
            members={project.members}
            projectData={project} // Pass project data to avoid duplicate fetch
          />
        )}
      </div>

      {/* Access Level Info */}
      {!canViewAllTasks && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Limited Task View</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  You can only see tasks where you are assigned to subtasks. Contact the project leader for broader access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterImportance} onValueChange={setFilterImportance}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by importance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Importance</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Created Date</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="importance">Importance</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List Area - Now delegated to Leader or Member view */}
      {canViewAllTasks ? (
        <TasksViewLeader
          projectId={projectId}
          project={project}
          tasks={filteredAndSortedTasks}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onSubTaskUpdated={handleSubTaskUpdated}
          onSubTaskCreated={handleSubTaskCreated}
          onSubTaskDeleted={handleSubTaskDeleted}
          canCreateTasks={canCreateTasks} // For empty state in leader view
          rawTasksCount={tasks.length} // Pass the original count for better empty state messages
        />
      ) : (
        <TasksViewMember
          projectId={projectId}
          project={project}
          tasks={filteredAndSortedTasks.filter(task => // Further filter for member if they can't see all
            task.subTasks.some(st => st.assignedId === project.currentUserId) || task.createdBy === project.currentUserId
          )}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onSubTaskUpdated={handleSubTaskUpdated}
          onSubTaskCreated={handleSubTaskCreated}
          onSubTaskDeleted={handleSubTaskDeleted}
          canViewAllTasks={canViewAllTasks} // Pass this to tailor messages in member view
          rawTasksCount={tasks.length}
        />
      )}
    </div>
  );
}

// Type definitions were added at the top for clarity during refactoring.
// TaskCard and SubTaskItem functional components are moved.