"use client";

import { Loader2 } from 'lucide-react';
import { useTasksData } from './hooks/useTasksData';
import { useTaskFilters } from './hooks/useTaskFilters';
import { TasksHeader } from './components/TasksHeader';
import { AccessLevelInfo } from './components/AccessLevelInfo';
import { TasksFilters } from './components/TasksFilters';
import { EmptyState } from './components/EmptyState';
import { TaskCard } from './components/TaskCard';

interface TasksViewProps {
  projectId: string;
}

export function TasksView({ projectId }: TasksViewProps) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
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

  const canViewAllTasks = project.isLeader || project.userPermissions.includes('viewFiles');

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