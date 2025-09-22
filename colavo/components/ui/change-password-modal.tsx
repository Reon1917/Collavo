"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Lock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  isOpen,
  onOpenChange,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword && currentPassword.trim()) {
      newErrors.newPassword = 'New password must be different from current password';
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
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true, // Security: revoke all other sessions
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'Current password is incorrect') {
          setErrors({ currentPassword: 'Current password is incorrect' });
        } else {
          toast.error(result.error || 'Failed to change password. Please try again.');
        }
        return;
      }

      toast.success('Password changed successfully');
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      // Handle password change error silently
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your account password. You&apos;ll remain signed in on this device.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-foreground">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                                 onChange={(e) => {
                   setCurrentPassword(e.target.value);
                   if (errors.currentPassword) {
                     // eslint-disable-next-line @typescript-eslint/no-unused-vars
                     const { currentPassword: _, ...rest } = errors;
                     setErrors(rest);
                   }
                 }}
                disabled={isLoading}
                className={`pr-10 ${errors.currentPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          <Separator className="my-4" />

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
                className={`pr-10 ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your new password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            <p className="text-xs text-muted-foreground">
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
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

          <Separator className="my-4" />

          {/* Forgot Password Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Can&apos;t remember your current password?{' '}
              <Link 
                href="/forgot-password" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={() => handleClose()}
              >
                Reset it instead
              </Link>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 