import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores/navigation-store';

export const useNavigationLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for route changes (if using app router with client navigation)
    // This is a basic implementation - you might need to adjust based on your routing setup
    
    return () => {
      // Clean up listeners if needed
    };
  }, []);

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