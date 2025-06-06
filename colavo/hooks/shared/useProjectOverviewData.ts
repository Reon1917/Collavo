import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OverviewData {
  project: any;
  tasks: any[];
  members: any[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalMembers: number;
    recentActivity: {
      recentTasks: any[];
      activeMembers: any[];
    };
  };
}

interface UseProjectOverviewDataResult {
  data: OverviewData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: OverviewData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useProjectOverviewData(projectId: string): UseProjectOverviewDataResult {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (bypassCache = false) => {
    const cacheKey = `overview-${projectId}`;
    
    // Check cache first
    if (!bypassCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/overview`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const overviewData: OverviewData = await response.json();
      
      // Cache the data
      cache.set(cacheKey, {
        data: overviewData,
        timestamp: Date.now()
      });

      setData(overviewData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch overview data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const refreshData = useCallback(() => {
    fetchData(true); // Bypass cache on manual refresh
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refreshData,
  };
}

// Helper hook for individual data pieces (maintains backwards compatibility)
export function useProjectDataFromOverview(projectId: string) {
  const { data, isLoading, error, refreshData } = useProjectOverviewData(projectId);
  
  return {
    project: data?.project || null,
    tasks: data?.tasks || [],
    members: data?.members || [],
    stats: data?.stats || null,
    isLoading,
    error,
    refreshData,
  };
} 