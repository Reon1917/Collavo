import { NextRequest, NextResponse } from 'next/server';

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
    // Check for authentication cookie (better-auth sets this automatically)
    const authCookie = request.cookies.get('better-auth.session_token') || 
                      request.cookies.get('better-auth.session');
    
    // If no auth cookie, user is not authenticated
    if (!authCookie || !authCookie.value) {
      // Redirect to login with callback URL
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // User has auth cookie, continue (validation happens on API routes)
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
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