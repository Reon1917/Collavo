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
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    // For auth routes, redirect authenticated users to dashboard
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      try {
        const session = await auth.api.getSession({
          headers: request.headers
        });
        
        if (session?.user) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Allow access to public route if auth check fails
      }
    }
    return NextResponse.next();
  }
  
  // Protected routes - require authentication
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
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