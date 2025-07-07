'use client';

import { useEffect, RefObject } from 'react';

interface UseClickOutsideOptions {
  ignoreSelectors?: string[];
  delay?: number;
}

export function useClickOutside<T extends HTMLElement | null = HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  options: UseClickOutsideOptions = {}
) {
  const { ignoreSelectors = [], delay = 0 } = options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't trigger if clicking inside the ref element
      if (ref.current && ref.current.contains(target)) {
        return;
      }
      
      // Don't trigger if clicking on ignored selectors
      for (const selector of ignoreSelectors) {
        if (target.closest(selector)) {
          return;
        }
      }
      
      // Execute handler with optional delay
      if (delay > 0) {
        setTimeout(() => {
          // Double-check that ignored selectors are still not present
          const stillIgnored = ignoreSelectors.some(selector => 
            document.querySelector(selector) !== null
          );
          
          if (!stillIgnored) {
            handler();
          }
        }, delay);
      } else {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, ignoreSelectors, delay]);
}