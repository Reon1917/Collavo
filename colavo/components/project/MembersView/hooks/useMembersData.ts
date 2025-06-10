import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Member, ProjectPermissions } from '../types';

export function useMembersData(projectId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [permissions, setPermissions] = useState<ProjectPermissions>({ 
    userPermissions: [], 
    isLeader: false 
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/members`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Project not found or access denied');
          return;
        }
        throw new Error('Failed to fetch members');
      }

      const membersData = await response.json();
      setMembers(membersData);
    } catch {
      toast.error('Failed to load project members');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchProjectPermissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Project not found or access denied');
          return;
        }
        throw new Error('Failed to fetch project permissions');
      }

      const projectData = await response.json();
      setPermissions({
        userPermissions: projectData.userPermissions || [],
        isLeader: projectData.isLeader || false
      });
      setCurrentUserId(projectData.currentUserId || null);
    } catch {
      // Don't show error toast for permissions, just fail silently
    }
  }, [projectId]);

  const refreshMembers = useCallback(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchProjectPermissions()]);
  }, [fetchMembers, fetchProjectPermissions]);

  return {
    members,
    permissions,
    currentUserId,
    isLoading,
    refreshMembers
  };
} 