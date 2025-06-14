# Frontend Componentization & Performance Optimization

## Overview

This document outlines Collavo's Next.js componentization strategy for optimal loading performance, code splitting, and user experience. We leverage Next.js 15's App Router, React 19, and modern optimization patterns.

## Core Architecture

### App Router Structure
```
app/
├── layout.tsx               # Root layout with providers
├── page.tsx                # Landing page
├── dashboard/              # Dashboard routes
├── project/               # Project-specific routes
│   └── [id]/             # Dynamic project pages
├── api/                  # API routes
└── globals.css           # Global styles
```

### Component Hierarchy
```
components/
├── ui/                   # Reusable UI primitives (shadcn/ui)
├── project/             # Project-specific features
│   ├── ProjectView/     # Main project container
│   ├── TasksView/       # Task management
│   ├── MembersView/     # Member management
│   └── OverviewView/    # Project overview
├── tasks/               # Task-related components
├── members/             # Member-related components
└── events/              # Event-related components
```

## Performance Optimization Strategies

### 1. Route-Level Code Splitting

Next.js automatically code-splits at the route level. Each page in `app/` becomes a separate chunk:

```typescript
// Automatic splitting - each route is a separate bundle
app/dashboard/page.tsx     → dashboard.js
app/project/[id]/page.tsx  → project-[id].js
```

### 2. Component-Level Dynamic Imports

**Current Implementation Gap**: Add dynamic imports for heavy components.

```typescript
// Recommended: Dynamic import for heavy components
import dynamic from 'next/dynamic';
import { ContentLoading } from '@/components/ui/content-loading';

const TasksView = dynamic(
  () => import('@/components/project/TasksView/TasksView'),
  {
    loading: () => <ContentLoading message="Loading tasks..." />,
    ssr: false // For client-only components
  }
);

const ProjectView = dynamic(
  () => import('@/components/project/ProjectView/ProjectView'),
  {
    loading: () => <ContentLoading message="Loading project..." />
  }
);
```

### 3. Tab-Based Lazy Loading

**Current State**: All tabs load immediately
**Optimization**: Lazy load tab content

```typescript
// Enhanced ProjectView with lazy tab loading
export function ProjectView({ projectId }: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Lazy load components only when needed
  const OverviewTab = useMemo(() => 
    dynamic(() => import('./components/Tabs/OverviewTab'), {
      loading: () => <ContentLoading message="Loading overview..." />
    }), []
  );

  const TasksTab = useMemo(() => 
    dynamic(() => import('./components/Tabs/TasksTab'), {
      loading: () => <ContentLoading message="Loading tasks..." />
    }), []
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsContent value="overview">
        {activeTab === 'overview' && <OverviewTab {...props} />}
      </TabsContent>
      <TabsContent value="tasks">
        {activeTab === 'tasks' && <TasksTab {...props} />}
      </TabsContent>
    </Tabs>
  );
}
```

### 4. Data Prefetching Strategy

**Current Implementation**: Custom hooks with loading states
**Enhancement**: Add prefetching for anticipated user actions

```typescript
// Enhanced data fetching with prefetching
export function useProjectData(projectId: string) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Prefetch related data
  const prefetchTasks = useCallback(() => {
    // Prefetch task data when user hovers over Tasks tab
    void fetch(`/api/projects/${projectId}/tasks`);
  }, [projectId]);

  const prefetchMembers = useCallback(() => {
    // Prefetch member data when user hovers over Members tab
    void fetch(`/api/projects/${projectId}/members`);
  }, [projectId]);

  return { data, isLoading, prefetchTasks, prefetchMembers };
}
```

## Loading Performance Patterns

### 1. Optimistic UI Updates

```typescript
// Task creation with optimistic updates
export function useTaskCreation(projectId: string) {
  const [tasks, setTasks] = useState([]);
  
  const createTask = useCallback(async (taskData) => {
    // Optimistically add task to UI
    const optimisticTask = { ...taskData, id: 'temp-' + Date.now() };
    setTasks(prev => [...prev, optimisticTask]);
    
    try {
      const newTask = await api.createTask(taskData);
      // Replace optimistic task with real data
      setTasks(prev => prev.map(t => 
        t.id === optimisticTask.id ? newTask : t
      ));
    } catch (error) {
      // Revert optimistic update
      setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
      throw error;
    }
  }, []);
  
  return { tasks, createTask };
}
```

### 2. Skeleton Loading States

**Current Implementation**: `ContentLoading` component
**Enhancement**: Component-specific skeletons

```typescript
// Component-specific skeleton loaders
export function TaskCardSkeleton() {
  return (
    <div className="animate-pulse border rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}

export function TasksViewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 3. Image Optimization

```typescript
// Optimized image loading with Next.js Image
import Image from 'next/image';

export function MemberAvatar({ user }) {
  return (
    <Image
      src={user.avatar || '/default-avatar.png'}
      alt={`${user.name}'s avatar`}
      width={40}
      height={40}
      className="rounded-full"
      priority={false} // Only true for above-the-fold images
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..." // Base64 blur placeholder
    />
  );
}
```

## Component Design Patterns

### 1. Container/Presentation Separation

```typescript
// Container component (data logic)
export function TasksContainer({ projectId }) {
  const { tasks, isLoading, error } = useTasksData(projectId);
  
  if (isLoading) return <TasksViewSkeleton />;
  if (error) return <ErrorBoundary error={error} />;
  
  return <TasksPresentation tasks={tasks} />;
}

// Presentation component (pure UI)
export function TasksPresentation({ tasks }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### 2. Compound Components

```typescript
// Flexible, composable dialog components
export function TaskDialog({ children, ...props }) {
  return (
    <Dialog {...props}>
      {children}
    </Dialog>
  );
}

TaskDialog.Trigger = DialogTrigger;
TaskDialog.Content = DialogContent;
TaskDialog.Header = DialogHeader;
TaskDialog.Footer = DialogFooter;

// Usage
<TaskDialog>
  <TaskDialog.Trigger>Create Task</TaskDialog.Trigger>
  <TaskDialog.Content>
    <TaskDialog.Header>
      <DialogTitle>Create New Task</DialogTitle>
    </TaskDialog.Header>
    <CreateTaskForm />
    <TaskDialog.Footer>
      <Button>Cancel</Button>
      <Button>Create</Button>
    </TaskDialog.Footer>
  </TaskDialog.Content>
</TaskDialog>
```

### 3. Error Boundaries

```typescript
// Component-level error handling
export function ProjectViewErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            Failed to load project data. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Bundle Optimization

### 1. Tree Shaking

```typescript
// Good: Import only what you need
import { Button } from '@/components/ui/button';
import { format } from 'date-fns/format';

// Avoid: Importing entire libraries
import * as dateFns from 'date-fns'; // ❌
import _ from 'lodash'; // ❌
```

### 2. External Dependencies

```typescript
// next.config.ts optimization
const nextConfig: NextConfig = {
  // Bundle analyzer
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Separate vendor chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        // Large libraries get their own chunks
        charts: {
          test: /[\\/]node_modules[\\/]react-google-charts[\\/]/,
          name: 'charts',
          chunks: 'all',
        },
      };
    }
    return config;
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};
```

### 3. Service Worker (Future Enhancement)

```typescript
// public/sw.js - Cache static assets and API responses
self.addEventListener('fetch', (event) => {
  // Cache API responses for offline functionality
  if (event.request.url.includes('/api/projects')) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // Serve from cache while fetching fresh data
            fetch(event.request).then(fetchResponse => {
              cache.put(event.request, fetchResponse.clone());
            });
            return response;
          }
          return fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

## Performance Monitoring

### 1. Core Web Vitals

```typescript
// lib/analytics.ts
export function reportWebVitals(metric) {
  const { name, value, id } = metric;
  
  // Send to analytics service
  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    non_interaction: true,
  });
}

// app/layout.tsx
export default function RootLayout({ children }) {
  useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    });
  }, []);
  
  return children;
}
```

### 2. Bundle Analysis

```bash
# Add to package.json scripts
{
  "analyze": "ANALYZE=true next build",
  "analyze:server": "BUNDLE_ANALYZE=server next build",
  "analyze:browser": "BUNDLE_ANALYZE=browser next build"
}
```

## Implementation Roadmap

### Phase 1: Immediate Optimizations (1-2 days)
1. Add dynamic imports to heavy components (ProjectView, TasksView)
2. Implement tab-based lazy loading
3. Add component-specific skeleton loaders
4. Optimize image loading with Next.js Image

### Phase 2: Advanced Patterns (3-5 days)
1. Implement prefetching for anticipated user actions
2. Add optimistic UI updates for common actions
3. Set up error boundaries for better UX
4. Optimize bundle splitting in next.config.ts

### Phase 3: Monitoring & Analytics (2-3 days)
1. Implement Core Web Vitals tracking
2. Set up bundle analysis workflow
3. Add performance monitoring dashboard
4. Create performance regression tests

## Best Practices Summary

1. **Route-level splitting**: Automatic with App Router
2. **Component-level splitting**: Use `dynamic()` for heavy components
3. **Data loading**: Implement loading states and skeletons
4. **Error handling**: Use error boundaries for graceful failures
5. **Image optimization**: Always use Next.js Image component
6. **Bundle optimization**: Tree shake imports, split vendor chunks
7. **Performance monitoring**: Track Core Web Vitals and bundle sizes

## Current Performance Metrics

- **First Contentful Paint**: Target < 1.5s
- **Largest Contentful Paint**: Target < 2.5s
- **Cumulative Layout Shift**: Target < 0.1
- **Time to Interactive**: Target < 3.5s

## Tools & Resources

- **Bundle Analyzer**: `@next/bundle-analyzer`
- **Performance**: Lighthouse CI, Web Vitals
- **Monitoring**: Vercel Analytics, Google Analytics
- **Testing**: Playwright for performance regression tests 