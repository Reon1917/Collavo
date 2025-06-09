"use client";

import { useState, useMemo } from 'react';
import { Event } from '../types';

interface UseEventFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterTimeframe: 'all' | 'upcoming' | 'past' | 'today';
  setFilterTimeframe: (timeframe: 'all' | 'upcoming' | 'past' | 'today') => void;
  sortBy: 'datetime' | 'title' | 'created';
  setSortBy: (sort: 'datetime' | 'title' | 'created') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  filteredAndSortedEvents: Event[];
}

export function useEventFilters(events: Event[]): UseEventFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTimeframe, setFilterTimeframe] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [sortBy, setSortBy] = useState<'datetime' | 'title' | 'created'>('datetime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.creatorName.toLowerCase().includes(query)
      );
    }

    // Apply timeframe filter
    if (filterTimeframe !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.datetime);
        
        switch (filterTimeframe) {
          case 'upcoming':
            return eventDate >= now;
          case 'past':
            return eventDate < now;
          case 'today':
            return eventDate >= today && eventDate < tomorrow;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'datetime':
          comparison = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [events, searchQuery, filterTimeframe, sortBy, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    filterTimeframe,
    setFilterTimeframe,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredAndSortedEvents,
  };
} 