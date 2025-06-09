import { useEffect, useRef } from 'react';

interface TabPreloaderOptions {
  projectId: string;
  currentTab: string;
  preloadDelay?: number; // Delay before preloading (ms)
}

export function useTabPreloader({ projectId, currentTab, preloadDelay = 2000 }: TabPreloaderOptions) {
  const preloadedTabs = useRef<Set<string>>(new Set());
  
  const preloadTabData = async (projectId: string, currentTab: string) => {
    const tabsToPreload = ['tasks', 'events', 'members', 'files'].filter(
      tab => tab !== currentTab && !preloadedTabs.current.has(tab)
    );

    // Preload data for other tabs in background
    tabsToPreload.forEach(async (tab) => {
      try {
        if (tab === 'tasks' && !preloadedTabs.current.has('tasks')) {
          fetch(`/api/projects/${projectId}/tasks`, { credentials: 'include' });
          preloadedTabs.current.add('tasks');
        }
          
        if (tab === 'events' && !preloadedTabs.current.has('events')) {
          fetch(`/api/projects/${projectId}/events`, { credentials: 'include' });
          preloadedTabs.current.add('events');
        }
        
        if (tab === 'members' && !preloadedTabs.current.has('members')) {
          fetch(`/api/projects/${projectId}/members`, { credentials: 'include' });
          preloadedTabs.current.add('members');
        }
        
        if (tab === 'files' && !preloadedTabs.current.has('files')) {
          fetch(`/api/projects/${projectId}/files`, { credentials: 'include' });
          preloadedTabs.current.add('files');
        }
      } catch {
        // Silently handle preload errors - no logging needed
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only preload if user stays on current tab for specified delay
      preloadTabData(projectId, currentTab);
    }, preloadDelay);

    return () => clearTimeout(timer);
  }, [projectId, currentTab, preloadDelay]);
} 