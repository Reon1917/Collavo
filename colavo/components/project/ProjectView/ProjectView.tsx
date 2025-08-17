"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectData } from '@/hooks/shared/useProjectData';
import { useProjectPermissions } from '@/hooks/shared/useProjectPermissions';
import { ProjectHeader } from './components/ProjectHeader';
import { OverviewTab } from './components/Tabs/OverviewTab';
import { TasksTab } from './components/Tabs/TasksTab';
import { MembersTab } from '@/components/project/ProjectView/components/Tabs/MembersTab';
import { ContentLoading } from '@/components/ui/content-loading';
import { useNavigationStore } from '@/lib/stores/navigation-store';

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const { setLoading } = useNavigationStore();
  const { project, tasks, isLoading, refreshData } = useProjectData(projectId);
  const permissions = useProjectPermissions(project);
  const [activeTab, setActiveTab] = useState('overview');

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
        <h2 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">Project not found</h2>
        <p className="text-muted-foreground dark:text-muted-foreground">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      <ProjectHeader project={project} roleDisplay={permissions.roleDisplay} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted dark:bg-muted border border-border dark:border-border p-1.5 rounded-xl shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:font-semibold dark:data-[state=active]:bg-card dark:data-[state=active]:text-secondary dark:data-[state=active]:border-secondary/30 hover:bg-background/50 dark:hover:bg-gray-700 text-muted-foreground dark:text-muted-foreground data-[state=inactive]:hover:text-foreground dark:data-[state=inactive]:hover:text-gray-200 transition-all duration-300 rounded-lg px-4 py-2.5 font-medium relative overflow-hidden data-[state=active]:scale-[1.02]"
          >
            <span className="relative z-10">Overview</span>
            {activeTab === 'overview' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#008080]/5 to-[#008080]/10 dark:from-[#00FFFF]/5 dark:to-[#00FFFF]/10" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:font-semibold dark:data-[state=active]:bg-card dark:data-[state=active]:text-secondary dark:data-[state=active]:border-secondary/30 hover:bg-background/50 dark:hover:bg-gray-700 text-muted-foreground dark:text-muted-foreground data-[state=inactive]:hover:text-foreground dark:data-[state=inactive]:hover:text-gray-200 transition-all duration-300 rounded-lg px-4 py-2.5 font-medium relative overflow-hidden data-[state=active]:scale-[1.02]"
          >
            <span className="relative z-10">Tasks ({tasks.length})</span>
            {activeTab === 'tasks' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#008080]/5 to-[#008080]/10 dark:from-[#00FFFF]/5 dark:to-[#00FFFF]/10" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="members" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:font-semibold dark:data-[state=active]:bg-card dark:data-[state=active]:text-secondary dark:data-[state=active]:border-secondary/30 hover:bg-background/50 dark:hover:bg-gray-700 text-muted-foreground dark:text-muted-foreground data-[state=inactive]:hover:text-foreground dark:data-[state=inactive]:hover:text-gray-200 transition-all duration-300 rounded-lg px-4 py-2.5 font-medium relative overflow-hidden data-[state=active]:scale-[1.02]"
          >
            <span className="relative z-10">Members ({project.members.length})</span>
            {activeTab === 'members' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#008080]/5 to-[#008080]/10 dark:from-[#00FFFF]/5 dark:to-[#00FFFF]/10" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab 
            project={project}
            tasks={tasks}
            events={[]}
            files={[]}
            permissions={permissions}
            onRefresh={refreshData}
            onTabChange={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab 
            projectId={projectId}
            tasks={tasks}
            members={project.members}
            canCreateTasks={permissions.canCreateTasks}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="members">
          <MembersTab 
            project={project}
            permissions={permissions}
            onRefresh={refreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 