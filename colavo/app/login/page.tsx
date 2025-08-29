"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
//import { useAuth } from '@/providers/auth-provider';

export default function LoginPage() {
  const searchParams = useSearchParams();
  //const { refetch: _refetch } = useAuth();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        toast.error('Invalid credentials. Please try again.');
      } else {
        toast.success('Login successful!');
        
        // Force a small delay and reload to ensure session is properly established
        setTimeout(() => {
          // Use window.location.href for a full page reload to ensure middleware runs
          window.location.href = callbackUrl;
        }, 500); // Increased delay to ensure session is saved
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: callbackUrl,
      });
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 dark:from-emerald-900 dark:via-teal-800 dark:to-cyan-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative 3D Components */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Component 2 - Top Right */}
        <div className="absolute top-10 right-10 lg:top-20 lg:right-20 opacity-60 animate-float-delayed">
          <Image
            src="/component2.png"
            alt="3D Component 2"
            width={112}
            height={112}
            className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
          />
        </div>
        
        {/* Component 1 - Bottom Left */}
        <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 opacity-50 animate-float">
          <Image
            src="/component1.png"
            alt="3D Component 1"
            width={128}
            height={128}
            className="w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-lg"
          />
        </div>
        
        {/* Additional subtle elements */}
        <div className="absolute top-1/3 left-1/4 w-2 h-12 bg-white/10 rounded-full rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-8 bg-white/8 rounded-full -rotate-12 animate-pulse"></div>
      </div>

      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
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
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-white/80">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-white hover:text-white/90 hover:underline transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-white/80">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/60 focus:border-white/50 focus:ring-white/30"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/60 focus:border-white/50 focus:ring-white/30"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-white hover:text-white/90 hover:underline transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-white/90 hover:bg-white text-teal-600 hover:text-teal-700 border-0 font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-white/80">
            New to our platform?{' '}
            <Link
              href="/signup"
              className="font-medium text-white hover:text-white/90 hover:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Social Login Options (for future implementation) */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/10 backdrop-blur-sm text-white/80 rounded">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 