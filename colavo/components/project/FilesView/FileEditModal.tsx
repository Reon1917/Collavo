"use client";

import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';

interface FileEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    id: string;
    name: string;
    description?: string | null;
    url: string;
    size?: number | null;
    mimeType?: string | null;
    addedAt: string;
    addedByName: string;
    addedByEmail: string;
  } | null;
  projectId: string;
  onFileUpdated?: (file: any) => void;
}

export function FileEditModal({
  isOpen,
  onOpenChange,
  file,
  projectId,
  onFileUpdated
}: FileEditModalProps) {
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Update form fields when file changes
  useEffect(() => {
    if (file) {
      setFileName(file.name);
      setDescription(file.description || '');
      setUpdateError(null);
    }
  }, [file]);

  const handleReset = () => {
    setFileName('');
    setDescription('');
    setUpdateError(null);
  };

  const handleClose = () => {
    if (!isUpdating) {
      handleReset();
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    if (!fileName.trim()) {
      setUpdateError('Please enter a file name.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/files/${file.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fileName.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If it's a permission error, show toast and close modal
        if (response.status === 403 || response.status === 404) {
          setIsUpdating(false); // Reset loading state first
          toast.error(errorData.error || 'Permission denied');
          handleClose();
          return;
        }
        throw new Error(errorData.error || 'Failed to update file');
      }

      const updatedFile = await response.json();
      
      // Call the callback to update the parent component
      if (onFileUpdated) {
        onFileUpdated(updatedFile);
      }
      
      // Close modal and reset
      handleClose();
      
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update file');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit File
          </DialogTitle>
          <DialogDescription>
            Update the file name and description. The file itself cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name *</Label>
            <Input
              id="fileName"
              type="text"
              placeholder="Enter file name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
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
              placeholder="Enter file description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
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
              disabled={!fileName.trim() || isUpdating}
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