"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Project } from '@/hooks/shared/useProjectData';

interface ProjectEditDialogProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function ProjectEditDialog({ project, isOpen, onClose, onRefresh }: ProjectEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: undefined as Date | undefined
  });

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name,
        description: project.description || '',
        deadline: project.deadline ? new Date(project.deadline) : undefined
      });
    }
  }, [project, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          deadline: formData.deadline ? formData.deadline.toISOString() : null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      toast.success('Project updated successfully!');
      onClose();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background dark:bg-card border border-border dark:border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-foreground flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Project Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
            Update your project information. All fields are optional except the project name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium text-foreground">
              Project Name *
            </Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="Enter project name..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary min-h-[80px] resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Project Deadline
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background dark:bg-muted border-border dark:border-border hover:bg-background dark:hover:bg-card hover:border-primary dark:hover:border-secondary",
                    !formData.deadline && "text-muted-foreground dark:text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, "PPP") : "Select deadline (optional)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background dark:bg-card border border-border dark:border-border">
                <CalendarComponent
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

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
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim()}
            className="flex-1 bg-primary hover:bg-[#006666] text-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Project'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 