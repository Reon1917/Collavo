"use client";

import { useState, useEffect, useCallback } from 'react';
import { Event, Project, getCachedRequest, setCachedRequest, clearCacheForProject } from '../types';

interface UseEventsDataReturn {
  events: Event[];
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  handleEventCreated: (event: Event) => void;
  handleEventUpdated: (event: Event) => void;
  handleEventDeleted: (eventId: string) => void;
  refetch: () => Promise<void>;
}

export function useEventsData(projectId: string): UseEventsDataReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (): Promise<Event[]> => {
    const cacheKey = `events-${projectId}`;
    const cached = getCachedRequest<Event[]>(cacheKey);
    if (cached) return cached;

    const response = await fetch(`/api/projects/${projectId}/events`);
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    const data = await response.json();
    setCachedRequest(cacheKey, data.events);
    return data.events;
  }, [projectId]);

  const fetchProject = useCallback(async (): Promise<Project> => {
    const cacheKey = `project-${projectId}`;
    const cached = getCachedRequest<Project>(cacheKey);
    if (cached) return cached;

    const response = await fetch(`/api/projects/${projectId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }
    const data = await response.json();
    setCachedRequest(cacheKey, data);
    return data;
  }, [projectId]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [eventsData, projectData] = await Promise.all([
        fetchEvents(),
        fetchProject()
      ]);
      
      setEvents(eventsData);
      setProject(projectData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  }, [fetchEvents, fetchProject]);

  const refetch = useCallback(async () => {
    clearCacheForProject(projectId);
    await fetchData();
  }, [projectId, fetchData]);

  const handleEventCreated = useCallback((newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev]);
    clearCacheForProject(projectId);
  }, [projectId]);

  const handleEventUpdated = useCallback((updatedEvent: Event) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    clearCacheForProject(projectId);
  }, [projectId]);

  const handleEventDeleted = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    clearCacheForProject(projectId);
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, fetchData]);

  return {
    events,
    project,
    isLoading,
    error,
    handleEventCreated,
    handleEventUpdated,
    handleEventDeleted,
    refetch,
  };
} 