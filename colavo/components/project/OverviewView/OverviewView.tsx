"use client";

import { useEffect } from 'react';
import { useProjectOverviewData } from '@/hooks/shared/useProjectOverviewData';
import { useProjectPermissions } from '@/hooks/shared/useProjectPermissions';
import { ProjectHeader } from '../ProjectView/components/ProjectHeader';
import { OverviewTab } from '../ProjectView/components/Tabs/OverviewTab';
import { ContentLoading } from '@/components/ui/content-loading';
import { useNavigationStore } from '@/lib/stores/navigation-store';
import type { OverviewViewProps } from './types';

export function OverviewView({ projectId }: OverviewViewProps) {
  const { setLoading } = useNavigationStore();
  const { data, isLoading, refreshData } = useProjectOverviewData(projectId);
  const project = data?.project || null;
  const tasks = data?.tasks || [];
  const events = data?.events || [];
  const permissions = useProjectPermissions(project);

  // Function to handle tab changes by updating URL
  const handleTabChange = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
    
    // Dispatch a custom event to notify the parent about tab change
    window.dispatchEvent(new CustomEvent('tabchange', { detail: { tab } }));
  };

  // Update navigation loading state
  useEffect(() => {
    setLoading(isLoading, `/project/${projectId}`);
    
    // Cleanup on unmount
    return () => setLoading(false);
  }, [isLoading, projectId, setLoading]);

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