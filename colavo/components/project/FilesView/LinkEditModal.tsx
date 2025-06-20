"use client";

import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';

interface LinkEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  link: {
    id: string;
    name: string;
    description?: string | null;
    url: string;
    addedAt: string;
    addedByName: string;
    addedByEmail: string;
  } | null;
  projectId: string;
  onLinkUpdated?: (link: any) => void;
}

export function LinkEditModal({
  isOpen,
  onOpenChange,
  link,
  projectId,
  onLinkUpdated
}: LinkEditModalProps) {
  const [linkName, setLinkName] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Update form fields when link changes
  useEffect(() => {
    if (link) {
      setLinkName(link.name);
      setDescription(link.description || '');
      setLinkUrl(link.url);
      setUpdateError(null);
    }
  }, [link]);

  const handleReset = () => {
    setLinkName('');
    setDescription('');
    setLinkUrl('');
    setUpdateError(null);
  };

  const handleClose = () => {
    if (!isUpdating) {
      handleReset();
      onOpenChange(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!link) return;
    
    if (!linkName.trim()) {
      setUpdateError('Please enter a link name.');
      return;
    }

    if (!linkUrl.trim()) {
      setUpdateError('Please enter a link URL.');
      return;
    }

    // Add protocol if missing
    let formattedUrl = linkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!isValidUrl(formattedUrl)) {
      setUpdateError('Please enter a valid URL.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/files/${link.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: linkName.trim(),
          description: description.trim() || null,
          url: formattedUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If it's a permission error, show toast and close modal
        if (response.status === 403 || response.status === 404) {
          toast.error(errorData.error || 'Permission denied');
          handleClose();
          return;
        }
        throw new Error(errorData.error || 'Failed to update link');
      }

      const updatedLink = await response.json();
      
      // Call the callback to update the parent component
      if (onLinkUpdated) {
        onLinkUpdated(updatedLink);
      }
      
      // Close modal and reset
      handleClose();
      
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update link');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!link) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Link
          </DialogTitle>
          <DialogDescription>
            Update the link name, description, and URL.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Link Name */}
          <div className="space-y-2">
            <Label htmlFor="linkName">Link Name *</Label>
            <Input
              id="linkName"
              type="text"
              placeholder="e.g., Project Design, Meeting Notes..."
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              maxLength={500}
              required
              disabled={isUpdating}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this link contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isUpdating}
            />
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL *</Label>
            <Input
              id="linkUrl"
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>

          {/* Error Message */}
          {updateError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{updateError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!linkName.trim() || !linkUrl.trim() || isUpdating}
              className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 