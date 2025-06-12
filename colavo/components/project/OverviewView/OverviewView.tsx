"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useProjectOverviewData } from '@/hooks/shared/useProjectOverviewData';
import { useProjectPermissions } from '@/hooks/shared/useProjectPermissions';
import { ProjectHeader } from '../ProjectView/components/ProjectHeader';
import { OverviewTab } from '../ProjectView/components/Tabs/OverviewTab';
import { ContentLoading } from '@/components/ui/content-loading';
import { useNavigationStore } from '@/lib/stores/navigation-store';
import type { OverviewViewProps } from './types';

export function OverviewView({ projectId }: OverviewViewProps) {
  const { setLoading } = useNavigationStore();
  const { data, isLoading, refreshData, refreshIfStale } = useProjectOverviewData(projectId);
  const project = data?.project || null;
  const tasks = data?.tasks || [];
  const events = data?.events || [];
  const permissions = useProjectPermissions(project);

  // Refs to track refresh state and prevent duplicates
  const lastRefreshTime = useRef<number>(0);
  const isCurrentlyOnOverview = useRef<boolean>(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced refresh function to prevent rapid successive calls
  const debouncedRefresh = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      const now = Date.now();
      // Only refresh if at least 2 seconds have passed since last refresh
      if (now - lastRefreshTime.current > 2000) {
        lastRefreshTime.current = now;
        refreshIfStale();
      }
    }, 500); // 500ms debounce
  }, [refreshIfStale]);

  // Function to handle tab changes by updating URL
  const handleTabChange = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
    
    // Track if we're on overview tab
    isCurrentlyOnOverview.current = tab === 'overview';
    
    // Dispatch a custom event to notify the parent about tab change
    window.dispatchEvent(new CustomEvent('tabchange', { detail: { tab } }));
  };

  // Update navigation loading state
  useEffect(() => {
    setLoading(isLoading, `/project/${projectId}`);
    
    // Cleanup on unmount
    return () => setLoading(false);
  }, [isLoading, projectId, setLoading]);

  // Consolidated page visibility and focus handler
  useEffect(() => {
    const handlePageVisible = () => {
      // Only refresh if page became visible and we're on overview tab
      if (!document.hidden && isCurrentlyOnOverview.current) {
        debouncedRefresh();
      }
    };

    // Use only visibilitychange - it covers both tab switching and window focus
    document.addEventListener('visibilitychange', handlePageVisible);

    return () => {
      document.removeEventListener('visibilitychange', handlePageVisible);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedRefresh]);

  // Refresh data when component mounts or projectId changes
  useEffect(() => {
    lastRefreshTime.current = Date.now();
    refreshData();
  }, [projectId, refreshData]);

  // Listen for tab changes and refresh when returning to overview
  useEffect(() => {
    const handleTabChangeEvent = (event: CustomEvent) => {
      if (event.detail.tab === 'overview' && !isCurrentlyOnOverview.current) {
        // User switched TO overview tab from another tab
        isCurrentlyOnOverview.current = true;
        debouncedRefresh();
      } else if (event.detail.tab !== 'overview') {
        // User switched away from overview
        isCurrentlyOnOverview.current = false;
      }
    };

    // Initialize current tab state
    const urlParams = new URLSearchParams(window.location.search);
    const currentTab = urlParams.get('tab') || 'overview';
    isCurrentlyOnOverview.current = currentTab === 'overview';

    window.addEventListener('tabchange', handleTabChangeEvent as EventListener);

    return () => {
      window.removeEventListener('tabchange', handleTabChangeEvent as EventListener);
    };
  }, [debouncedRefresh]);

  if (isLoading) {
    return (
      <ContentLoading 
        size="md" 
        message="Loading project..." 
        className="min-h-[400px]"
      />
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project not found</h2>
        <p className="text-gray-600 dark:text-gray-400">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} roleDisplay={permissions.roleDisplay} />
      
      <OverviewTab 
        project={project}
        tasks={tasks}
        events={events}
        permissions={permissions}
        onRefresh={refreshData}
        onTabChange={handleTabChange}
      />
    </div>
  );
} 