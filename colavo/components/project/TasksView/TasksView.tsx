"use client";

import { useEffect } from 'react';
import { useTasksData } from './hooks/useTasksData';
import { useTaskFilters } from './hooks/useTaskFilters';
import { TasksHeader } from './components/TasksHeader';
import { AccessLevelInfo } from './components/AccessLevelInfo';
import { TasksFilters } from './components/TasksFilters';
import { EmptyState } from './components/EmptyState';
import { TaskCard } from './components/TaskCard';
import { ContentLoading } from '@/components/ui/content-loading';
import { useNavigationStore } from '@/lib/stores/navigation-store';

interface TasksViewProps {
  projectId: string;
}

export function TasksView({ projectId }: TasksViewProps) {
  const { setLoading } = useNavigationStore();
  const {
    tasks,
    project,
    isLoading,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleSubTaskUpdated,
    handleSubTaskCreated,
    handleSubTaskDeleted,
  } = useTasksData(projectId);

  const {
    searchQuery,
    setSearchQuery,
    filterImportance,
    setFilterImportance,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    filteredAndSortedTasks,
  } = useTaskFilters(tasks);

  // Update navigation loading state
  useEffect(() => {
    setLoading(isLoading, `/project/${projectId}/tasks`);
    
    // Cleanup on unmount
    return () => setLoading(false);
  }, [isLoading, projectId, setLoading]);

  if (isLoading) {
    return (
      <ContentLoading 
        size="md" 
        message="Loading tasks..." 
        className="min-h-[400px]"
      />
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project not found</h2>
        <p className="text-gray-600 dark:text-gray-400">Unable to load project details or you don&apos;t have access to this project.</p>
      </div>
    );
  }

  const canViewAllTasks = true; // All members can view all tasks

  return (
    <div className="space-y-6">
      <TasksHeader project={project} onTaskCreated={handleTaskCreated} />
      
      <AccessLevelInfo canViewAllTasks={canViewAllTasks} />

      <TasksFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterImportance={filterImportance}
        setFilterImportance={setFilterImportance}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {filteredAndSortedTasks.length === 0 ? (
        <EmptyState 
          project={project} 
          totalTasks={tasks.length} 
          onTaskCreated={handleTaskCreated} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              project={project}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              onSubTaskUpdated={handleSubTaskUpdated}
              onSubTaskCreated={handleSubTaskCreated}
              onSubTaskDeleted={handleSubTaskDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
} 