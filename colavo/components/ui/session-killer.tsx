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
    // Routes where authenticated users should be logged out (only landing page)
    const authRedirectRoutes = ['/'];
    
    // If user is authenticated and on a route where they should be logged out
    // And we haven't already killed the session in this session
    if (session?.user && authRedirectRoutes.includes(pathname) && !hasKilledSession.current) {
      hasKilledSession.current = true;
      
      // Use authClient.signOut to properly clear both server and client state
      authClient.signOut()
        .then(() => {
          // Force a small delay to ensure state is properly cleared
          setTimeout(() => {
            if (window.location.pathname === pathname) {
              window.location.reload();
            }
          }, 200);
        })
        .catch(() => {
          // Fallback: try API endpoint if authClient.signOut fails
          fetch('/api/auth/kill-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(() => {
            setTimeout(() => {
              if (window.location.pathname === pathname) {
                window.location.reload();
              }
            }, 200);
          }).catch(() => {
            // Force reload as last resort
            window.location.reload();
          });
        });
    }
  }, [session, pathname]);

  return <>{children}</>;
} 