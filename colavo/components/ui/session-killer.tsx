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
      console.log('[SessionKiller] Authenticated user on landing page, signing out...');
      
      // Use authClient.signOut to properly clear both server and client state
      authClient.signOut()
        .then(() => {
          console.log('[SessionKiller] Session killed successfully');
          // Force a small delay to ensure state is properly cleared
          setTimeout(() => {
            if (window.location.pathname === pathname) {
              window.location.reload();
            }
          }, 200);
        })
        .catch((error) => {
          console.error('[SessionKiller] Error killing session:', error);
          // Fallback: try API endpoint if authClient.signOut fails
          fetch('/api/auth/kill-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(() => {
            console.log('[SessionKiller] Session killed via API fallback');
            setTimeout(() => {
              if (window.location.pathname === pathname) {
                window.location.reload();
              }
            }, 200);
          }).catch((apiError) => {
            console.error('[SessionKiller] API fallback also failed:', apiError);
            // Force reload as last resort
            window.location.reload();
          });
        });
    }
  }, [session, pathname]);

  return <>{children}</>;
} 