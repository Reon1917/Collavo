"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface SessionKillerProps {
  children: React.ReactNode;
}

export function SessionKiller({ children }: SessionKillerProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const hasKilledSession = useRef(false);

  useEffect(() => {
    // Routes where authenticated users should be logged out
    const authRedirectRoutes = ['/', '/login', '/signup'];
    
    // If user is authenticated and on a route where they should be logged out
    // And we haven't already killed the session in this session
    if (session?.user && authRedirectRoutes.includes(pathname) && !hasKilledSession.current) {
      hasKilledSession.current = true;
      // eslint-disable-next-line no-console
      console.log('[SessionKiller] Authenticated user on auth page, signing out...');
      
      // Kill session using our API endpoint for more reliable termination
      fetch('/api/auth/kill-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('[SessionKiller] Session killed successfully');
        // Force reload to clear any cached state
        window.location.reload();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[SessionKiller] Error killing session:', error);
        // Force reload anyway to clear state
        window.location.reload();
      });
    }
  }, [session, pathname]);

  return <>{children}</>;
} 