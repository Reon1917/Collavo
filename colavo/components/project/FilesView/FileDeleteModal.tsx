"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

interface FileDeleteModalProps {
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
  onFileDeleted?: (fileId: string) => void;
}

export function FileDeleteModal({
  isOpen,
  onOpenChange,
  file,
  projectId,
  onFileDeleted
}: FileDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isDeleting) {
      setDeleteError(null);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!file) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/files/${file.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
      
      // Call the callback to update the parent component
      if (onFileDeleted) {
        onFileDeleted(file.id);
      }
      
      // Close modal
      handleClose();
      
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Delete File
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The file will be permanently removed from both your project and file storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> This will permanently delete the file &quot;{file.name}&quot; and cannot be undone.
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
            {file.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{file.description}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Uploaded by {file.addedByName} • {new Date(file.addedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Error Message */}
          {deleteError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{deleteError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete File
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 