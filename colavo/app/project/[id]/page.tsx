'use client';

import { use, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OverviewView } from '@/components/project/OverviewView';
import { TasksView } from '@/components/project/TasksView/TasksView';
import { MembersView } from '@/components/project/MembersView';
import { FilesView } from '@/components/project/FilesView';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id: projectId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get('tab') || 'overview';

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
        return <TasksView projectId={projectId} />;
      case 'members':
        return <MembersView projectId={projectId} />;
      case 'files':
        return <FilesView projectId={projectId} />;
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
