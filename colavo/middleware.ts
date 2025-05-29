import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Public routes - allow access without authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/api/auth/[...all]',
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('[...')) {
      const basePath = route.split('[')[0];
      return pathname.startsWith(basePath);
    }
    return pathname === route;
  });
  
  // Allow access to static files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/landingpage-img/')
  ) {
    return NextResponse.next();
  }
  
  // For public routes, continue without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for session cookie using better-auth
  const sessionCookie = getSessionCookie(request);
  
  // If no session, user is not authenticated
  if (!sessionCookie) {
    // Redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // User is authenticated, continue
  return NextResponse.next();
}

// Configure which paths should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image).*)',
  ],
}; 