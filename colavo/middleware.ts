import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDev = process.env.NODE_ENV === 'development';
  
  // Early returns for static assets and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname === '/favicon.ico' ||
    pathname.startsWith('/landingpage-img/') ||
    pathname.startsWith('/api/') ||
    (pathname.includes('.') && !pathname.endsWith('/'))
  ) {
    return NextResponse.next();
  }
  
  // Public routes - use Set for O(1) lookup
  const publicRoutes = new Set([
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ]);

  // Routes that authenticated users should be redirected away from
  const authRedirectRoutes = new Set([
    '/',
    '/login',
    '/signup',
  ]);
  
  // Handle public routes FIRST - no auth check needed
  if (publicRoutes.has(pathname)) {
    if (isDev) {
      console.log('[Middleware] Public route accessed:', pathname);
    }
    
    // For certain public routes, kill session if user is authenticated (logout)
    // But allow access to forgot-password and reset-password even when authenticated
    if (authRedirectRoutes.has(pathname)) {
      try {
        const session = await auth.api.getSession({
          headers: request.headers
        });
        
        // If user is authenticated and on a route they should be logged out from, kill the session
        if (session?.user) {
          if (isDev) {
            console.log('[Middleware] Authenticated user on auth redirect route, killing session and allowing access');
          }
          
          // Kill the session by calling signOut
          try {
            await auth.api.signOut({
              headers: request.headers
            });
            if (isDev) {
              console.log('[Middleware] Session killed successfully');
            }
          } catch (signOutError) {
            if (isDev) {
              console.log('[Middleware] Error killing session:', signOutError);
            }
          }
          
          // Create response with cleared session cookies
          const response = NextResponse.next();
          
          // Clear auth cookies
          response.cookies.delete('better-auth.session_token');
          response.cookies.delete('better-auth.csrf_token');
          
          // Add cache control headers to prevent caching
          response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          response.headers.set('Pragma', 'no-cache');
          response.headers.set('Expires', '0');
          
          return response;
        }
      } catch (error) {
        // If auth check fails on public routes, just log and continue
        // This ensures public routes remain accessible even if auth service is down
        if (isDev) {
          console.log('[Middleware] Auth check failed on public route, allowing access anyway:', error);
        }
      }
    }
    
    // Allow access to public routes regardless of auth status
    return NextResponse.next();
  }
  
  // For protected routes, perform auth check
  try {
    if (isDev) {
      console.log('[Middleware] Checking auth for protected path:', pathname);
    }
    
    // Use better-auth's built-in session verification
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (isDev) {
      console.log('[Middleware] Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      });
    }
    
    // If no valid session, redirect to login
    if (!session?.user) {
      if (isDev) {
        console.log('[Middleware] No valid session, redirecting to login');
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (isDev) {
      console.log('[Middleware] Valid session found, allowing access');
    }
    
    // User has valid session, continue with cache control headers
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    
    // Add cache control headers to prevent caching of authenticated pages
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
    
  } catch (error) {
    console.error('[Middleware] Auth error on protected route:', error);
    // On error for protected routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which paths should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - API routes
     * - landingpage-img (static images)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|landingpage-img).*)',
  ],
};