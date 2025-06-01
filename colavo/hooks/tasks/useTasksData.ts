import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

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
  userRole: 'leader' | 'member' | null;
  currentUserId: string;
}

interface Member {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  userName: string;
  userEmail: string;
  userImage: string | null;
}

interface UseTasksDataReturn {
  tasks: Task[];
  project: Project | null;
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  handleTaskCreated: (newTask: Task) => void;
  handleTaskUpdated: (updatedTask: Partial<Task> & { id: string }) => void;
  handleTaskDeleted: (taskId: string) => void;
  handleSubTaskUpdated: (taskId: string, updatedSubTask: Partial<SubTask> & { id: string }) => void;
  handleSubTaskCreated: (taskId: string, newSubTask: SubTask) => void;
  handleSubTaskDeleted: (taskId: string, subtaskId: string) => void;
}

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

export function useTasksData(projectId: string): UseTasksDataReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ongoingRequests = useRef(new Set<string>());

  const fetchProjectData = useCallback(async (): Promise<Project | null> => {
    const cacheKey = `project-${projectId}`;
    const cached = getCachedRequest<Project>(cacheKey);
    if (cached) return cached;

    if (ongoingRequests.current.has(cacheKey)) {
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

  const handleTaskCreated = useCallback((newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  const handleTaskUpdated = useCallback((updatedTask: Partial<Task> & { id: string }) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id 
        ? { ...task, ...updatedTask }
        : task
    ));
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

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
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  const handleSubTaskCreated = useCallback((taskId: string, newSubTask: SubTask) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, subTasks: [newSubTask, ...task.subTasks] }
        : task
    ));
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  const handleSubTaskDeleted = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, subTasks: task.subTasks.filter(subtask => subtask.id !== subtaskId) }
        : task
    ));
    requestCache.delete(`tasks-${projectId}`);
  }, [projectId]);

  return {
    tasks,
    project,
    isLoading,
    fetchInitialData,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleSubTaskUpdated,
    handleSubTaskCreated,
    handleSubTaskDeleted,
  };
} 