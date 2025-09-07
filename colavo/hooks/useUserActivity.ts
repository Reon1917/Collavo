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
    'keydown', 
    'touchstart',
    'focusin',
    'click'
  ] // Removed high-frequency events: mousemove, scroll, touchmove, blur
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
      lastActivityRef.current = new Date();
      isActiveRef.current = true;
    }, debounceMs);
  }, [onActivity, debounceMs]);

  const handleActivity = useCallback((event: Event) => {
    // Ignore programmatic events
    if (event.isTrusted === false) return;
    
    // Throttle high-frequency events
    const now = Date.now();
    const lastActivity = lastActivityRef.current?.getTime() || 0;
    
    // Skip if activity was recorded less than 500ms ago (throttling)
    if (now - lastActivity < 500) return;
    
    // Update activity immediately (for UI state)
    lastActivityRef.current = new Date(now);
    isActiveRef.current = true;
    
    // Debounce the callback to prevent server spam
    debouncedOnActivity();
  }, [debouncedOnActivity]);

  useEffect(() => {
    // Store event listeners for proper cleanup
    const registeredEvents = new Map();
    
    // Add event listeners for all activity types
    events.forEach(eventType => {
      const listener = (event: Event) => handleActivity(event);
      registeredEvents.set(eventType, listener);
      
      document.addEventListener(eventType, listener, { 
        passive: true,
        capture: false // Changed to false for better performance
      });
    });

    // Cleanup function
    return () => {
      // Remove each registered event listener
      registeredEvents.forEach((listener, eventType) => {
        document.removeEventListener(eventType, listener);
      });
      registeredEvents.clear();
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
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