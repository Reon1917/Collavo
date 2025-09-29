import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchJsonWithProjectGuard } from '@/utils/api';

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

export function useProjectData(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjectData = useCallback(async (abortSignal?: AbortSignal) => {
    setIsLoading(true);

    try {
      const projectResult = await fetchJsonWithProjectGuard<Project>(`/api/projects/${projectId}`, {
        signal: abortSignal,
      });

      if (abortSignal?.aborted) {
        return;
      }

      if (projectResult.handled) {
        return;
      }

      setProject(projectResult.data ?? null);

      try {
        const tasksResult = await fetchJsonWithProjectGuard<Task[]>(`/api/projects/${projectId}/tasks`, {
          signal: abortSignal,
        });

        if (abortSignal?.aborted) {
          return;
        }

        if (tasksResult.handled) {
          return;
        }

        setTasks(tasksResult.data ?? []);
      } catch (tasksError) {
        if (abortSignal?.aborted) {
          return;
        }

        if (tasksError instanceof Error && tasksError.name === 'AbortError') {
          return;
        }

        // Fallback to empty list when tasks fetch fails; toast already handled if needed.
        setTasks([]);
      }
    } catch (error) {
      if (abortSignal?.aborted) {
        return;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      toast.error(error instanceof Error ? error.message : 'Failed to load project data');
    } finally {
      if (!abortSignal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [projectId]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchProjectData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchProjectData]);

  const refreshData = useCallback(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Force refresh permissions only (lighter than full data refresh)
  const refreshPermissions = useCallback(async (abortSignal?: AbortSignal) => {
    try {
      const result = await fetchJsonWithProjectGuard<Project>(`/api/projects/${projectId}`, {
        signal: abortSignal,
      });

      if (abortSignal?.aborted || result.handled || !result.data) {
        return;
      }

      setProject(prevProject => prevProject ? {
        ...prevProject,
        userPermissions: result.data.userPermissions,
        isLeader: result.data.isLeader,
        userRole: result.data.userRole
      } : result.data);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Failed to refresh permissions:', error);
      }
    }
  }, [projectId]);

  return {
    project,
    tasks,
    isLoading,
    refreshData,
    refreshPermissions
  };
}

export type { Project, Member, Task, SubTask };
