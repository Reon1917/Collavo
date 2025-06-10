'use client';

import { use, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OverviewView } from '@/components/project/OverviewView';
import { useTabPreloader } from '@/hooks/shared/useTabPreloader';
import { ContentLoading } from '@/components/ui/content-loading';

// Lazy load heavy components
const TasksView = lazy(() => import('@/components/project/TasksView/TasksView').then(m => ({ default: m.TasksView })));
const MembersView = lazy(() => import('@/components/project/MembersView').then(m => ({ default: m.MembersView })));
const FilesView = lazy(() => import('@/components/project/FilesView').then(m => ({ default: m.FilesView })));
const EventsView = lazy(() => import('@/components/project/EventsView').then(m => ({ default: m.EventsView })));

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id: projectId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get('tab') || 'overview';

  // Preload other tab data in background
  useTabPreloader({ 
    projectId, 
    currentTab: activeTab,
    preloadDelay: 1500 // Start preloading after 1.5s
  });

  // Listen for tab change events from child components
  useEffect(() => {
    const handleTabChangeEvent = (event: CustomEvent) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', event.detail.tab);
      router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    window.addEventListener('tabchange', handleTabChangeEvent as EventListener);
    
    return () => {
      window.removeEventListener('tabchange', handleTabChangeEvent as EventListener);
    };
  }, [searchParams, pathname, router]);

  // Render the appropriate view based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <Suspense fallback={<ContentLoading size="md" message="Loading tasks..." />}>
            <TasksView projectId={projectId} />
          </Suspense>
        );
      case 'events':
        return (
          <Suspense fallback={<ContentLoading size="md" message="Loading events..." />}>
            <EventsView projectId={projectId} />
          </Suspense>
        );
      case 'members':
        return (
          <Suspense fallback={<ContentLoading size="md" message="Loading members..." />}>
            <MembersView projectId={projectId} />
          </Suspense>
        );
      case 'files':
        return (
          <Suspense fallback={<ContentLoading size="md" message="Loading files..." />}>
            <FilesView projectId={projectId} />
          </Suspense>
        );
      case 'overview':
      default:
        return <OverviewView projectId={projectId} />;
    }
  };

  return (
    <div className="p-4 md:p-6">
      {renderContent()}
    </div>
  );
}
