"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Event } from '../../types';

interface EventDeleteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  projectId: string;
  onEventDeleted?: (eventId: string) => void;
}

export function EventDeleteModal({
  isOpen,
  onOpenChange,
  event,
  projectId,
  onEventDeleted
}: EventDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isDeleting) {
      setDeleteError(null);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/events/${event.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      
      // Call the callback to update the parent component
      if (onEventDeleted) {
        onEventDeleted(event.id);
      }
      
      toast.success('Event deleted successfully');
      
      // Close modal
      handleClose();
      
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Delete Event
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The event will be permanently removed from the project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> This will permanently delete the event &quot;{event.title}&quot; and cannot be undone.
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="p-3 bg-muted dark:bg-muted rounded-lg">
            <p className="font-medium text-foreground dark:text-foreground">{event.title}</p>
            {event.description && (
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{event.description}</p>
            )}
            <div className="text-xs text-muted-foreground dark:text-muted-foreground mt-2 space-y-1">
              <p>Scheduled: {new Date(event.datetime).toLocaleDateString()} at {new Date(event.datetime).toLocaleTimeString()}</p>
              {event.location && <p>Location: {event.location}</p>}
              <p>Created by {event.creatorName} • {new Date(event.createdAt).toLocaleDateString()}</p>
            </div>
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
                  Delete Event
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 