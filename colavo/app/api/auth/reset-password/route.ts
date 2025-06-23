import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Helper to get the correct base URL
const getBaseURL = (): string => {
  return process.env.BETTER_AUTH_URL || 
    (process.env.NODE_ENV === "production" 
      ? "https://collavo-alpha.vercel.app" 
      : "http://localhost:3000");
};

// POST /api/auth/reset-password - Handle password reset requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Call better-auth's forgetPassword method to trigger the sendResetPassword callback
    await auth.api.forgetPassword({
      body: { 
        email,
        redirectTo: `${getBaseURL()}/reset-password`
      },
      headers: request.headers,
    });

    return NextResponse.json({ 
      message: 'If an account with that email exists, we have sent password reset instructions.' 
    });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/reset-password - Handle actual password reset with token
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Call better-auth's resetPassword method
    await auth.api.resetPassword({
      body: { token, newPassword },
      headers: request.headers,
    });

    return NextResponse.json({ 
      message: 'Password reset successfully',
      success: true 
    });

  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Password reset error:', error);
    
    // Handle specific better-auth errors
    if (error.message?.includes('token') || error.message?.includes('expired') || error.message?.includes('invalid')) {
      return NextResponse.json(
        { error: 'Reset token is invalid or has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
