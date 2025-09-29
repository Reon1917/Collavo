import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { fetchJsonWithProjectGuard } from '@/utils/api';
import { Task, Project, SubTask, getCachedRequest, setCachedRequest, clearCacheForProject } from '../types';

export function useTasksData(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const { data, handled, errorMessage } = await fetchJsonWithProjectGuard<Project>(`/api/projects/${projectId}`);

      if (handled) {
        return null;
      }

      if (!data) {
        throw new Error(errorMessage || 'Failed to fetch project data');
      }

      setCachedRequest(cacheKey, data);
      return data;
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
      const { data, handled, errorMessage } = await fetchJsonWithProjectGuard<Task[]>(`/api/projects/${projectId}/tasks`);

      if (handled) {
        return [];
      }

      if (!data) {
        throw new Error(errorMessage || 'Failed to fetch tasks');
      }

      setCachedRequest(cacheKey, data);
      return data;
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

      setProject(projectData);
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

  // Optimistic task operations
  const handleTaskCreated = useCallback((newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    clearCacheForProject(projectId);
  }, [projectId]);

  const handleTaskUpdated = useCallback((updatedTask: Partial<Task> & { id: string }) => {
    setTasks(prev => prev.map(task =>
      task.id === updatedTask.id
        ? { ...task, ...updatedTask }
        : task
    ));
    clearCacheForProject(projectId);
  }, [projectId]);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    clearCacheForProject(projectId);
  }, [projectId]);

  // Optimistic subtask operations
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
    clearCacheForProject(projectId);
  }, [projectId]);

  const handleSubTaskCreated = useCallback((taskId: string, newSubTask: SubTask) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, subTasks: [...task.subTasks, newSubTask] }
        : task
    ));
    clearCacheForProject(projectId);
  }, [projectId]);

  const handleSubTaskDeleted = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, subTasks: task.subTasks.filter(subtask => subtask.id !== subtaskId) }
        : task
    ));
    clearCacheForProject(projectId);
  }, [projectId]);

  return {
    tasks,
    project,
    isLoading,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleSubTaskUpdated,
    handleSubTaskCreated,
    handleSubTaskDeleted,
  };
}
