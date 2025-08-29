"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))] px-4 relative overflow-hidden">
        {/* Decorative 3D Components */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 lg:top-20 lg:right-20 opacity-50 animate-float-delayed">
            <Image
              src="/component2.png"
              alt="3D Component 2"
              width={96}
              height={96}
              className="w-16 h-16 lg:w-24 lg:h-24 object-contain drop-shadow-lg"
            />
          </div>
          <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 opacity-40 animate-float">
            <Image
              src="/component1.png"
              alt="3D Component 1"
              width={112}
              height={112}
              className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Logo in top left corner */}
        <div className="absolute top-4 left-4 flex items-center space-x-3 z-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-card/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-border/30">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <h3 className="text-xl font-bold text-primary-foreground">Collavo</h3>
          </Link>
        </div>

        <Card className="w-full max-w-md bg-card/10 backdrop-blur-md border-border/20 shadow-xl relative z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary-foreground">Check Your Email</CardTitle>
            <CardDescription className="text-foreground/80">
              We&apos;ve sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-foreground/80 mb-4">
              Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full border-border/30 bg-card/10 backdrop-blur-sm text-primary-foreground hover:bg-card/20 hover:border-border/50 py-3">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))] px-4 py-16 relative overflow-hidden">
      {/* Decorative 3D Components */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 lg:top-20 lg:right-20 opacity-60 animate-float-delayed">
          <Image
            src="/component2.png"
            alt="3D Component 2"
            width={112}
            height={112}
            className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
          />
        </div>
        <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 opacity-50 animate-float">
          <Image
            src="/component1.png"
            alt="3D Component 1"
            width={128}
            height={128}
            className="w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-lg"
          />
        </div>
        <div className="absolute top-1/3 left-1/4 w-2 h-12 bg-white/10 rounded-full rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-8 bg-white/8 rounded-full -rotate-12 animate-pulse"></div>
      </div>

      {/* Logo in top left corner */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 z-20">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-card/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-border/30">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <h3 className="text-xl font-bold text-primary-foreground">Collavo</h3>
        </Link>
      </div>

      <Card className="w-full max-w-lg bg-card/10 backdrop-blur-md border-border/20 shadow-xl relative z-10">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-2xl font-bold text-center text-primary-foreground">Reset Password</CardTitle>
          <CardDescription className="text-center text-foreground/80">
            Enter your email address and we&apos;ll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary-foreground text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-card/20 backdrop-blur-sm border-border/30 text-primary-foreground placeholder-foreground/60 focus:border-border/50 focus:ring-ring/30 h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground hover:text-primary-foreground border-0 font-semibold py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Sending instructions...' : 'Send Reset Instructions'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-6 px-6">
          <div className="text-sm text-foreground/80">
            Remember your password?{' '}
            <Link href="/login" className="text-primary-foreground hover:text-primary-foreground/90 hover:underline font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 