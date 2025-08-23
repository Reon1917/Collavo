"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
// Removed authClient import as we're using fetch API directly
import { toast } from 'sonner';

export default function ResetPasswordPage() {
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
      // eslint-disable-next-line no-console
      console.error('Password reset error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 dark:from-emerald-900 dark:via-teal-800 dark:to-cyan-900 px-4 relative overflow-hidden">
        {/* Decorative 3D Components */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 lg:top-20 lg:right-20 opacity-50 animate-float-delayed">
            <img 
              src="/component2.png" 
              alt="3D Component 2" 
              className="w-16 h-16 lg:w-24 lg:h-24 object-contain drop-shadow-lg"
            />
          </div>
          <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 opacity-40 animate-float">
            <img 
              src="/component1.png" 
              alt="3D Component 1" 
              className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Logo in top left corner */}
        <div className="absolute top-4 left-4 flex items-center space-x-3 z-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h3 className="text-xl font-bold text-white">Collavo</h3>
          </Link>
        </div>

        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-xl relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Password Reset Successfully</CardTitle>
            <CardDescription className="text-white/80">
              Your password has been updated. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button className="w-full bg-white/90 hover:bg-white text-teal-600 hover:text-teal-700 border-0 font-semibold py-3">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 dark:from-emerald-900 dark:via-teal-800 dark:to-cyan-900 px-4 relative overflow-hidden">
        {/* Decorative 3D Components */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 lg:top-20 lg:right-20 opacity-50 animate-float-delayed">
            <img 
              src="/component2.png" 
              alt="3D Component 2" 
              className="w-16 h-16 lg:w-24 lg:h-24 object-contain drop-shadow-lg"
            />
          </div>
          <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 opacity-40 animate-float">
            <img 
              src="/component1.png" 
              alt="3D Component 1" 
              className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Logo in top left corner */}
        <div className="absolute top-4 left-4 flex items-center space-x-3 z-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h3 className="text-xl font-bold text-white">Collavo</h3>
          </Link>
        </div>

        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-xl relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Invalid Reset Link</CardTitle>
            <CardDescription className="text-white/80">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-white/80">
              Please request a new password reset link to continue.
            </p>
            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full bg-white/90 hover:bg-white text-teal-600 hover:text-teal-700 border-0 font-semibold py-3">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 py-3">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 dark:from-emerald-900 dark:via-teal-800 dark:to-cyan-900 px-4 py-16 relative overflow-hidden">
      {/* Decorative 3D Components */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 lg:top-20 lg:right-20 opacity-60 animate-float-delayed">
          <img 
            src="/component2.png" 
            alt="3D Component 2" 
            className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
          />
        </div>
        <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 opacity-50 animate-float">
          <img 
            src="/component1.png" 
            alt="3D Component 1" 
            className="w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-lg"
          />
        </div>
        <div className="absolute top-1/3 left-1/4 w-2 h-12 bg-white/10 rounded-full rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-8 bg-white/8 rounded-full -rotate-12 animate-pulse"></div>
      </div>

      {/* Logo in top left corner */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 z-20">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <h3 className="text-xl font-bold text-white">Collavo</h3>
        </Link>
      </div>

      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-md border-white/20 shadow-xl relative z-10">
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">Set New Password</CardTitle>
          <CardDescription className="text-center text-white/80">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white text-sm font-medium">
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
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { newPassword: _, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  disabled={isLoading}
                  className={`pr-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/60 focus:border-white/50 focus:ring-white/30 h-11 ${errors.newPassword ? 'border-red-300 focus:border-red-300' : ''}`}
                  placeholder="Enter your new password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-200 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.newPassword}
                </p>
              )}
              <p className="text-xs text-white/60">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
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
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { confirmPassword: _, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  disabled={isLoading}
                  className={`pr-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/60 focus:border-white/50 focus:ring-white/30 h-11 ${errors.confirmPassword ? 'border-red-300 focus:border-red-300' : ''}`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-200 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-white/90 hover:bg-white text-teal-600 hover:text-teal-700 border-0 font-semibold py-3"
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
        <CardFooter className="flex justify-center pt-6 px-6">
          <div className="text-sm text-white/80">
            Remember your password?{' '}
            <Link href="/login" className="text-white hover:text-white/90 hover:underline font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 