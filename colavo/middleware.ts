import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export async function middleware(request: NextRequest) {
  // Only protect specific routes, let the client-side handle most redirects
  const { pathname } = request.nextUrl;
  
  // Allow all public paths and auth-related paths
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  // For all other paths, let them proceed - the client-side components will handle auth
  return NextResponse.next();
}

// Configure which paths to run the middleware on
export const config = {
  matcher: [
    // Apply to all paths except public assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
}; 