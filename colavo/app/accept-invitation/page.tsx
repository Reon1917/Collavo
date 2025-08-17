"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface InvitationStatus {
  requiresRegistration?: boolean;
  email?: string;
  projectId?: string;
  token?: string;
  message?: string;
  error?: string;
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState<InvitationStatus>({});
  const [userInfo, setUserInfo] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus({ error: 'Invalid invitation link' });
      setLoading(false);
      return;
    }

    // Try to accept invitation immediately for existing users
    acceptInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresRegistration) {
          setStatus(data);
          setLoading(false);
        } else {
          setStatus({ message: data.message });
          toast.success('Successfully joined project!');
          setTimeout(() => {
            router.push(`/project/${data.projectId}`);
          }, 2000);
        }
      } else {
        setStatus({ error: data.error });
      }
    } catch (error) {
      setStatus({ error: 'Failed to process invitation' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userInfo.password !== userInfo.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (userInfo.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setAccepting(true);

    try {
      // First, register the user using Better Auth
      const registerResult = await authClient.signUp.email({
        email: status.email!,
        name: userInfo.name,
        password: userInfo.password,
      });

      if (registerResult.error) {
        throw new Error(registerResult.error.message || 'Registration failed');
      }

      // Then accept the invitation
      const acceptResponse = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      });

      const acceptData = await acceptResponse.json();

      if (acceptResponse.ok) {
        toast.success('Account created and joined project successfully!');
        setTimeout(() => {
          router.push(`/project/${acceptData.projectId}`);
        }, 2000);
      } else {
        throw new Error(acceptData.error || 'Failed to join project');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Clock className="h-8 w-8 text-[#008080] animate-pulse" />
            </div>
            <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
              Processing invitation...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>{status.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status.message) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Success!</CardTitle>
            <CardDescription>{status.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Redirecting to project...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status.requiresRegistration) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-12 w-12 bg-[#008080] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <CardTitle>Complete Your Registration</CardTitle>
            <CardDescription>
              Create your account to join the project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={status.email || ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={userInfo.password}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="Choose a password (min 8 characters)"
                  minLength={8}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={userInfo.confirmPassword}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  placeholder="Confirm your password"
                  minLength={8}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-[#008080] hover:bg-[#006666]"
                disabled={accepting}
              >
                {accepting ? 'Creating Account...' : 'Create Account & Join Project'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

