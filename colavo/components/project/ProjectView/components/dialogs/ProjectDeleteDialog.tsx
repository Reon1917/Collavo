"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/hooks/shared/useProjectData';

interface ProjectDeleteDialogProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDeleteDialog({ project, isOpen, onClose }: ProjectDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      toast.success('Project deleted successfully!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background dark:bg-card border border-border dark:border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-foreground flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Project
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
            Are you sure you want to delete &quot;{project?.name}&quot;? This action cannot be undone and will permanently delete all project data, tasks, and member associations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Project'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 