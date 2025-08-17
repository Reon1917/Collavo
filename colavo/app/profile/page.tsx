"use client";

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ChangePasswordModal } from '@/components/ui/change-password-modal';
import { ColorThemeSwitcher } from '@/components/ui/color-theme-switcher';
import Link from 'next/link';
import { ArrowLeft, User, Lock, LogOut, Trash2, Palette } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await refetch();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Error logging out');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Sign out the user and redirect
      await authClient.signOut();
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted dark:bg-card">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/dashboard" className="text-primary hover:text-primary/80 flex items-center transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Info Card */}
            <Card className="bg-background dark:bg-card border border-border/60 dark:border-border shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-2xl text-foreground dark:text-foreground font-bold">Profile Information</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground mt-1">
                  Your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <Avatar className="h-28 w-28 border-4 border-primary/20">
                        <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="p-4 bg-muted dark:bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1">Full Name</h3>
                      <p className="text-lg font-medium text-foreground dark:text-foreground">{user.name}</p>
                    </div>
                    <div className="p-4 bg-muted dark:bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1">Email Address</h3>
                      <p className="text-lg text-foreground dark:text-foreground">{user.email}</p>
                    </div>
                    <div className="p-4 bg-muted dark:bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1">Member Since</h3>
                      <p className="text-lg text-foreground dark:text-foreground">
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

            {/* Account Settings */}
            <Card className="bg-background dark:bg-card border border-border/60 dark:border-border shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-2xl text-foreground dark:text-foreground font-bold">Account Settings</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground mt-1">
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-6 border-primary text-primary hover:bg-primary/10 transition-colors rounded-lg"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <User className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-6 border-primary text-primary hover:bg-primary/10 transition-colors rounded-lg"
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Lock className="h-5 w-5" />
                      <span>Change Password</span>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-6 border-primary text-primary hover:bg-primary/10 transition-colors rounded-lg"
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
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Trash2 className="h-5 w-5" />
                      <span>Delete Account</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ColorThemeSwitcher />
              
              <Card className="bg-background dark:bg-card border border-border/60 dark:border-border shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="h-2 bg-secondary"></div>
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-xl text-foreground dark:text-foreground font-bold">More Settings</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-muted-foreground mt-1">
                    Additional customization options coming soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      More appearance and accessibility options will be available in future updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onOpenChange={setShowChangePasswordModal}
      />

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account? This action cannot be undone and will permanently delete:

• All projects you lead (including all tasks, events, files, and members)
• All tasks and subtasks you created or were assigned to
• All events and files you added
• Your membership in all projects

This will completely remove your account and all associated data."
        confirmText="Delete My Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
} 