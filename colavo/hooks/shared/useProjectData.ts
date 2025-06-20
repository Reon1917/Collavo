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

  const fetchProjectData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [projectResponse, tasksResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/tasks`)
      ]);
      
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
    } catch {
      toast.error('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const refreshData = useCallback(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Force refresh permissions only (lighter than full data refresh)
  const refreshPermissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const projectData = await response.json();
        setProject(prevProject => prevProject ? {
          ...prevProject,
          userPermissions: projectData.userPermissions,
          isLeader: projectData.isLeader,
          userRole: projectData.userRole
        } : projectData);
      }
    } catch {
      // Silent fail - will be caught by next full refresh
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