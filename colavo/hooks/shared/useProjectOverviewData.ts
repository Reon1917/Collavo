import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchJsonWithProjectGuard } from '@/utils/api';

interface OverviewData {
  project: any;
  tasks: any[];
  members: any[];
  events: any[];
  files: any[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalMembers: number;
    totalEvents: number;
    totalFiles: number;
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
  refreshIfStale: () => void;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: OverviewData; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (shorter cache for more responsive updates)

// Function to clear cache for a specific project
export function clearOverviewCache(projectId: string) {
  cache.delete(`overview-${projectId}`);
}

// Function to clear all overview cache
export function clearAllOverviewCache() {
  cache.clear();
}

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

      const { data: overviewData, handled, errorMessage } = await fetchJsonWithProjectGuard<OverviewData>(
        `/api/projects/${projectId}/overview`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (handled) {
        setError(errorMessage ?? 'Project no longer available.');
        return;
      }

      if (!overviewData) {
        setError('Failed to fetch overview data');
        return;
      }

      // Cache the data
      cache.set(cacheKey, {
        data: overviewData,
        timestamp: Date.now(),
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

  // Function to check if cache is stale and refresh if needed
  const refreshIfStale = useCallback(() => {
    const cacheKey = `overview-${projectId}`;
    const cached = cache.get(cacheKey);

    // If no cache or cache is older than 1 minute, refresh
    if (!cached || Date.now() - cached.timestamp > 60 * 1000) {
      fetchData(true);
    }
  }, [projectId, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refreshData,
    refreshIfStale,
  };
}

// Helper hook for individual data pieces (maintains backwards compatibility)
export function useProjectDataFromOverview(projectId: string) {
  const { data, isLoading, error, refreshData } = useProjectOverviewData(projectId);

  return {
    project: data?.project || null,
    tasks: data?.tasks || [],
    members: data?.members || [],
    events: data?.events || [],
    files: data?.files || [],
    stats: data?.stats || null,
    isLoading,
    error,
    refreshData,
  };
}
