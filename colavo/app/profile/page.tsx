"use client";

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ChangePasswordModal } from '@/components/ui/change-password-modal';
import Link from 'next/link';
import { ArrowLeft, Lock, LogOut, Trash2, Edit3, Check, X } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { ThemePicker } from '@/components/ui/theme-picker';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await refetch();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Error logging out');
    }
  };

  const handleNameEdit = () => {
    setEditedName(user?.name || '');
    setIsEditingName(true);
  };

  const handleNameCancel = () => {
    setEditedName(user?.name || '');
    setIsEditingName(false);
  };

  const handleNameSave = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (editedName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update name');
      }

      await refetch();
      toast.success('Name updated successfully');
      setIsEditingName(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setIsUpdatingName(false);
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

  useEffect(() => {
    if (user?.name) {
      setEditedName(user.name);
    }
  }, [user?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <DashboardNavbar />
        
        {/* Sticky Back Button */}
        <div className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/dashboard" className="text-primary hover:text-primary/80 flex items-center transition-colors font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Info Card */}
            <Card className="bg-card border-border shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-2xl text-foreground font-bold">Profile Information</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
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
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="text-lg font-medium"
                            placeholder="Enter your name"
                            disabled={isUpdatingName}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleNameSave();
                              } else if (e.key === 'Escape') {
                                handleNameCancel();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleNameSave}
                            disabled={isUpdatingName}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleNameCancel}
                            disabled={isUpdatingName}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-medium text-foreground">{user.name}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleNameEdit}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
                      <p className="text-lg text-foreground">{user.email}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Member Since</h3>
                      <p className="text-lg text-foreground">
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

            {/* Theme Picker */}
            <ThemePicker userId={user.id} />

            {/* Quick Actions */}
            <Card className="bg-card border-border shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-2xl text-foreground font-bold">Account Settings</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Button 
                    variant="outline" 
                    className="h-auto py-8 px-6 border-2 border-primary/50 text-foreground hover:bg-primary/5 hover:text-foreground hover:border-primary/80 transition-all duration-200 rounded-2xl shadow-xl hover:shadow-2xl bg-background/80 backdrop-blur-sm ring-1 ring-border/50"
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-3 rounded-xl bg-primary/15 ring-1 ring-primary/20">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-semibold text-sm">Change Password</span>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-8 px-6 border-2 border-primary/50 text-foreground hover:bg-primary/5 hover:text-foreground hover:border-primary/80 transition-all duration-200 rounded-2xl shadow-xl hover:shadow-2xl bg-background/80 backdrop-blur-sm ring-1 ring-border/50"
                    onClick={handleSignOut}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-3 rounded-xl bg-primary/15 ring-1 ring-primary/20">
                        <LogOut className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-semibold text-sm">Logout</span>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-8 px-6 border-2 border-destructive/70 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive transition-all duration-200 rounded-2xl shadow-xl hover:shadow-2xl bg-background/80 backdrop-blur-sm ring-1 ring-destructive/20"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-3 rounded-xl bg-destructive/15 ring-1 ring-destructive/20">
                        <Trash2 className="h-6 w-6 text-destructive" />
                      </div>
                      <span className="font-semibold text-sm">Delete Account</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
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