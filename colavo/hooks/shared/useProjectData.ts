import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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
      const [projectResponse, tasksResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`, { signal: abortSignal || null }),
        fetch(`/api/projects/${projectId}/tasks`, { signal: abortSignal || null })
      ]);
      
      // Check if request was aborted
      if (abortSignal?.aborted) return;
      
      if (!projectResponse.ok) {
        throw new Error('Failed to fetch project data');
      }
      
      const projectData = await projectResponse.json();
      setProject(projectData);

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } else {
        setTasks([]);
      }
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') return;
      toast.error('Failed to load project data');
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
      const response = await fetch(`/api/projects/${projectId}`, { signal: abortSignal || null });
      
      if (abortSignal?.aborted) return;
      
      if (response.ok) {
        const projectData = await response.json();
        if (!abortSignal?.aborted) {
          setProject(prevProject => prevProject ? {
            ...prevProject,
            userPermissions: projectData.userPermissions,
            isLeader: projectData.isLeader,
            userRole: projectData.userRole
          } : projectData);
        }
      }
    } catch (error) {
      // Silent fail unless it's not an abort error
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