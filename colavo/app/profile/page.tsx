"use client";

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, User, Lock, LogOut, Trash2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await refetch();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Error logging out');
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }



  return (
    <div className="min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Info Card */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group hover:border-cyan-500/50 dark:hover:border-cyan-400/50">
            <div className="h-2 bg-cyan-500 dark:bg-cyan-400"></div>
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-2xl text-gray-900 dark:text-white font-bold group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Profile Information</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-cyan-500/20 dark:border-cyan-400/20">
                      <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                      <AvatarFallback className="bg-cyan-500 dark:bg-cyan-400 text-white text-2xl font-semibold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</h3>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</h3>
                    <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</h3>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Recently joined'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group hover:border-cyan-500/50 dark:hover:border-cyan-400/50">
            <div className="h-2 bg-cyan-500 dark:bg-cyan-400"></div>
            <CardHeader className="pb-4 pt-6">
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your account and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 px-6 border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-400/10 transition-colors rounded-lg"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <User className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 px-6 border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-400/10 transition-colors rounded-lg"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Lock className="h-5 w-5" />
                    <span>Change Password</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 px-6 border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-400/10 transition-colors rounded-lg"
                  onClick={handleSignOut}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 px-6 border-red-500 dark:border-red-400 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Account</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 