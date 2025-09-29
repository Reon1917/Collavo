'use client';

import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectDeletionWatcherProps {
  fallbackUrl?: string;
}

interface ProjectDeletionEventDetail {
  redirectTo: string;
  handled: boolean;
}

const ProjectDeletionWatcher = ({ fallbackUrl = '/dashboard' }: ProjectDeletionWatcherProps): ReactElement | null => {
  const router = useRouter();

  useEffect(() => {
    const handleProjectDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<ProjectDeletionEventDetail>;
      const detail = customEvent.detail;

      if (!detail) {
        return;
      }

      const destination = detail.redirectTo || fallbackUrl;

      // Mark handled to suppress the global hard redirect fallback.
      detail.handled = true;
      router.replace(destination);
    };

    window.addEventListener('project:deleted', handleProjectDeleted as EventListener);

    return () => {
      window.removeEventListener('project:deleted', handleProjectDeleted as EventListener);
    };
  }, [router, fallbackUrl]);

  return null;
};

export default ProjectDeletionWatcher;
