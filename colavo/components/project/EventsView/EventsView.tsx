"use client";

import { useEffect } from 'react';
import { useEventsData } from './hooks/useEventsData';
import { useEventFilters } from './hooks/useEventFilters';
import { EventsHeader } from './components/EventsHeader';
import { AccessLevelInfo } from './components/AccessLevelInfo';
import { EventsFilters } from './components/EventsFilters';
import { EmptyState } from './components/EmptyState';
import { EventCard } from './components/EventCard';
import { ContentLoading } from '@/components/ui/content-loading';
import { useNavigationStore } from '@/lib/stores/navigation-store';

interface EventsViewProps {
  projectId: string;
}

export function EventsView({ projectId }: EventsViewProps) {
  const { setLoading } = useNavigationStore();
  const {
    events,
    project,
    isLoading,
    error,
    handleEventCreated,
    handleEventUpdated,
    handleEventDeleted,
  } = useEventsData(projectId);

  const {
    searchQuery,
    setSearchQuery,
    filterTimeframe,
    setFilterTimeframe,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredAndSortedEvents,
  } = useEventFilters(events);

  // Update navigation loading state
  useEffect(() => {
    setLoading(isLoading, `/project/${projectId}/events`);
    
    // Cleanup on unmount
    return () => setLoading(false);
  }, [isLoading, projectId, setLoading]);

  if (isLoading) {
    return (
      <ContentLoading 
        size="md" 
        message="Loading events..." 
        className="min-h-[400px]"
      />
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error loading events</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
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

  const canCreateEvents = project.isLeader || project.userPermissions.includes('createEvent');
  const canHandleEvents = project.isLeader || project.userPermissions.includes('handleEvent');

  return (
    <div className="space-y-6">
      <EventsHeader 
        project={project} 
        canCreateEvents={canCreateEvents}
        onEventCreated={handleEventCreated} 
      />
      
      <AccessLevelInfo 
        canCreateEvents={canCreateEvents}
        canHandleEvents={canHandleEvents} 
      />

      <EventsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterTimeframe={filterTimeframe}
        setFilterTimeframe={setFilterTimeframe}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {filteredAndSortedEvents.length === 0 ? (
        <EmptyState 
          project={project} 
          totalEvents={events.length}
          canCreateEvents={canCreateEvents}
          onEventCreated={handleEventCreated} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              project={project}
              canHandleEvents={canHandleEvents}
              onEventUpdated={handleEventUpdated}
              onEventDeleted={handleEventDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
} 