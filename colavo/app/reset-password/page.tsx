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
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background px-4">
        <Card className="w-full max-w-md bg-background dark:bg-card border border-border/60 dark:border-border shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground dark:text-foreground">Password Reset Successfully</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground">
              Your password has been updated. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/70 text-foreground">
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
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background px-4">
        <Card className="w-full max-w-md bg-background dark:bg-card border border-border/60 dark:border-border shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground dark:text-foreground">Invalid Reset Link</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground dark:text-muted-foreground">
              Please request a new password reset link to continue.
            </p>
            <div className="space-y-2">
              <Link href="/forgot-password">
                <Button className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/70 text-foreground">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full border-border dark:border-gray-600 text-foreground hover:bg-muted dark:hover:bg-muted">
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
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background px-4 py-12">
      <Card className="w-full max-w-md bg-background dark:bg-card border border-border/60 dark:border-border shadow-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-secondary/10">
            <Lock className="h-6 w-6 text-primary dark:text-secondary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground dark:text-foreground">Set New Password</CardTitle>
          <CardDescription className="text-center text-muted-foreground dark:text-muted-foreground">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">
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
                  className={`pr-10 bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary transition-colors ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your new password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-gray-300"
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
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
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
                  className={`pr-10 bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-gray-300"
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
              className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/70 text-foreground"
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
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 dark:text-secondary dark:hover:text-secondary/80 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 