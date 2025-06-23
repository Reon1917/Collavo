import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/auth/kill-session - Forcefully terminate current session
export async function POST(request: NextRequest) {
  try {
    // Kill the session using better-auth
    await auth.api.signOut({
      headers: request.headers
    });

    // Create response with cleared cookies
    const response = NextResponse.json(
      { message: 'Session terminated successfully' },
      { status: 200 }
    );

    // Clear Better Auth cookies (correct cookie names)
    response.cookies.delete('better-auth.session_token');
    response.cookies.delete('better-auth.csrf_token');
    
    // Additional security: clear cookies with explicit settings
    try {
      response.cookies.set('better-auth.session_token', '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      response.cookies.set('better-auth.csrf_token', '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } catch {
      // Cookie clearing is secondary to session termination
    }
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch {
    // Even if there's an error, return success and clear cookies
    const response = NextResponse.json(
      { message: 'Session cleared' },
      { status: 200 }
    );

    // Clear Better Auth cookies safely
    try {
      response.cookies.set('better-auth.session_token', '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      response.cookies.set('better-auth.csrf_token', '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } catch {
      // Silent fallback
    }
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }
} 