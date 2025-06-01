import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Public routes - allow access without authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
  ];
  
  // Allow access to static files and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/landingpage-img/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Allow files with extensions
  ) {
    return NextResponse.next();
  }
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // For public routes, continue without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    console.log('[Middleware] Checking auth for path:', pathname);
    
    // Use better-auth's built-in session verification
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    console.log('[Middleware] Session check result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id
    });
    
    // If no valid session, redirect to login
    if (!session || !session.user) {
      console.log('[Middleware] No valid session, redirecting to login');
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    console.log('[Middleware] Valid session found, allowing access');
    // User has valid session, continue
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Auth error:', error);
    // On error, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
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
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}; 