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

    // Clear all possible auth cookies
    response.cookies.delete('better-auth.session_token');
    response.cookies.delete('better-auth.csrf_token');
    response.cookies.delete('authjs.session-token');
    response.cookies.delete('__Secure-authjs.session-token');
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Kill session error:', error);
    
    // Even if there's an error, return success and clear cookies
    const response = NextResponse.json(
      { message: 'Session cleared' },
      { status: 200 }
    );

    // Clear cookies anyway
    response.cookies.delete('better-auth.session_token');
    response.cookies.delete('better-auth.csrf_token');
    response.cookies.delete('authjs.session-token');
    response.cookies.delete('__Secure-authjs.session-token');
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }
} 