"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Password reset link sent to your email');
      } else {
        toast.error(data.error || 'An error occurred');
      }
    } catch {
      setIsLoading(false);
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background px-4">
        <Card className="w-full max-w-md bg-background dark:bg-card border border-border/60 dark:border-border shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground dark:text-foreground">Check Your Email</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground">
              We&apos;ve sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground dark:text-muted-foreground mb-4">
              Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full border-border dark:border-gray-600 text-foreground hover:bg-muted dark:hover:bg-muted">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background px-4 py-12">
      <Card className="w-full max-w-md bg-background dark:bg-card border border-border/60 dark:border-border shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground dark:text-foreground">Reset Password</CardTitle>
          <CardDescription className="text-center text-muted-foreground dark:text-muted-foreground">
            Enter your email address and we&apos;ll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/70 text-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Sending instructions...' : 'Send Reset Instructions'}
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