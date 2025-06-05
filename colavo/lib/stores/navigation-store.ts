import { create } from 'zustand';

interface NavigationState {
  activeRoute: string;
  isLoading: boolean;
  loadingRoute: string;
  setActiveRoute: (route: string) => void;
  setLoading: (loading: boolean, route?: string) => void;
  isRouteActive: (route: string, currentPath: string) => boolean;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeRoute: '',
  isLoading: false,
  loadingRoute: '',
  
  setActiveRoute: (route: string) => {
    set({ activeRoute: route });
  },
  
  setLoading: (loading: boolean, route?: string) => {
    set({ 
      isLoading: loading, 
      loadingRoute: loading ? (route || '') : '' 
    });
  },
  
  isRouteActive: (route: string, currentPath: string) => {
    // Handle "Back to Dashboard" - only active if we're exactly on dashboard
    if (route === '/dashboard') {
      return currentPath === '/dashboard';
    }
    
    // Handle project routes
    if (route.includes('/project/')) {
      // Extract the base route pattern (e.g., "/project/123" or "/project/123/tasks")
      const routeParts = route.split('/');
      const currentParts = currentPath.split('/');
      
      // For overview route (e.g., "/project/123")
      if (routeParts.length === 3) {
        return currentParts.length === 3 && 
               currentParts[1] === 'project' && 
               currentParts[2] === routeParts[2];
      }
      
      // For sub-routes (e.g., "/project/123/tasks")
      if (routeParts.length === 4) {
        return currentPath.startsWith(route);
      }
    }
    
    return currentPath === route;
  }
})); 