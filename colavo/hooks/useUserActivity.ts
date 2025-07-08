'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseUserActivityOptions {
  onActivity: () => void;
  debounceMs?: number;
  events?: string[];
}

interface UseUserActivityReturn {
  isActive: boolean;
  lastActivity: Date | null;
}

/**
 * Hook to detect user activity for real-time presence
 * Tracks multiple types of user interactions and calls onActivity callback
 */
export function useUserActivity({ 
  onActivity, 
  debounceMs = 2000,
  events = [
    'mousedown',
    'mousemove', 
    'keydown',
    'scroll',
    'touchstart',
    'touchmove',
    'click',
    'focus',
    'blur'
  ]
}: UseUserActivityOptions): UseUserActivityReturn {
  const lastActivityRef = useRef<Date | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef<boolean>(false);

  const debouncedOnActivity = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onActivity();
    }, debounceMs);
  }, [onActivity, debounceMs]);

  const handleActivity = useCallback(() => {
    const now = new Date();
    lastActivityRef.current = now;
    isActiveRef.current = true;
    debouncedOnActivity();
  }, [debouncedOnActivity]);

  useEffect(() => {
    // Add event listeners for all activity types
    events.forEach(eventType => {
      document.addEventListener(eventType, handleActivity, { 
        capture: true 
      });
    });

    // Cleanup function
    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleActivity, { 
          capture: true 
        });
      });
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [events, handleActivity]);
  // Handle visibility change for immediate activity detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User came back to tab - immediate activity
        lastActivityRef.current = new Date();
        isActiveRef.current = true;
        onActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onActivity]);

  return {
    isActive: isActiveRef.current,
    lastActivity: lastActivityRef.current
  };
} 