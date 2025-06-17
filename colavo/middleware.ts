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
  ]);
  
  try {
    if (isDev) {
      console.log('[Middleware] Checking auth for path:', pathname);
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
    
    // Handle public routes
    if (publicRoutes.has(pathname)) {
      // If user is authenticated and on a public route, redirect to dashboard
      if (session?.user) {
        if (isDev) {
          console.log('[Middleware] Authenticated user on public route, redirecting to dashboard');
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // If not authenticated, allow access to public routes
      return NextResponse.next();
    }
    
    // For protected routes, check authentication
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
    
    // User has valid session, continue with optional response headers
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
    
  } catch (error) {
    console.error('[Middleware] Auth error:', error);
    // On error, redirect to login
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