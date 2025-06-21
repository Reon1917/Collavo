import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores/navigation-store';

export const useNavigationLoading = () => {
  const [isLoading] = useState(false);

  // Simple hook that returns loading state
  // Currently not implementing actual navigation loading detection
  // Can be extended in the future if needed
  
  return isLoading;
};

// Removed useSessionValidation hook - not needed for simple session killing

export function useNavigationLoadingOld() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading, setActiveRoute } = useNavigationStore();

  useEffect(() => {
    // Start loading when route changes
    setLoading(true, pathname);
    
    // Set the active route immediately for visual feedback
    setActiveRoute(pathname);
    
    // Simulate route change completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100); // Short delay to prevent flashing
    
    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams, setLoading, setActiveRoute]);

  useEffect(() => {
    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Clear loading state when user returns to tab
        setLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setLoading]);
} 