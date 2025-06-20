"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    token?: string;
  }>({});

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrors({ token: 'Invalid or missing reset token' });
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!token) {
      newErrors.token = 'Invalid or missing reset token';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token!,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.includes('token') || result.error?.includes('expired') || result.error?.includes('invalid')) {
          setErrors({ token: 'Reset link has expired or is invalid' });
          toast.error('Reset link has expired or is invalid');
        } else {
          toast.error(result.error || 'Failed to reset password');
        }
      } else {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f0] dark:bg-gray-950 px-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Password Reset Successfully</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your password has been updated. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button className="w-full bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70 text-white">
                Continue to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - invalid token
  if (errors.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f0] dark:bg-gray-950 px-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Invalid Reset Link</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please request a new password reset link to continue.
            </p>
            <div className="space-y-2">
              <Link href="/forgot-password">
                <Button className="w-full bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70 text-white">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f8f0] dark:bg-gray-950 px-4 py-12">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#008080]/10 dark:bg-[#00FFFF]/10">
            <Lock className="h-6 w-6 text-[#008080] dark:text-[#00FFFF]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">Set New Password</CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      const { newPassword, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  disabled={isLoading}
                  className={`pr-10 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] transition-colors ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your new password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.newPassword}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      const { confirmPassword, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  disabled={isLoading}
                  className={`pr-10 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link href="/login" className="text-[#008080] hover:text-[#008080]/80 dark:text-[#00FFFF] dark:hover:text-[#00FFFF]/80 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 