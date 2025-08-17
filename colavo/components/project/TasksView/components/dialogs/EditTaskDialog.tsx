"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Edit3, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task } from '../../types';

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectId: string;
  projectDeadline: string | null;
  onTaskUpdated?: (updatedTask: Partial<Task> & { id: string }) => void;
}

interface TaskFormData {
  title: string;
  description: string;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date | undefined;
}

export function EditTaskDialog({
  isOpen,
  onOpenChange,
  task,
  projectId,
  projectDeadline,
  onTaskUpdated
}: EditTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: task.title,
    description: task.description || '',
    importanceLevel: task.importanceLevel,
    deadline: task.deadline ? new Date(task.deadline) : undefined
  });

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || '',
      importanceLevel: task.importanceLevel,
      deadline: task.deadline ? new Date(task.deadline) : undefined
    });
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!formData.importanceLevel) {
      toast.error('Please select an importance level');
      return;
    }

    if (!formData.deadline) {
      toast.error('Deadline is required for all tasks');
      return;
    }

    if (projectDeadline && formData.deadline > new Date(projectDeadline)) {
      toast.error('Task deadline cannot be later than project deadline');
      return;
    }

    const titleChanged = formData.title.trim() !== task.title;
    const descriptionChanged = formData.description.trim() !== (task.description || '');
    const importanceChanged = formData.importanceLevel !== task.importanceLevel;
    const deadlineChanged = formData.deadline?.toISOString() !== task.deadline;
    
    if (!titleChanged && !descriptionChanged && !importanceChanged && !deadlineChanged) {
      toast.error('No changes made to save');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          importanceLevel: formData.importanceLevel,
          deadline: formData.deadline.toISOString()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      toast.success('Task updated successfully!');
      onOpenChange(false);
      onTaskUpdated?.({
        id: task.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        importanceLevel: formData.importanceLevel,
        deadline: formData.deadline?.toISOString()
      });
    } catch {
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: task.title,
      description: task.description || '',
      importanceLevel: task.importanceLevel,
      deadline: task.deadline ? new Date(task.deadline) : undefined
    });
    onOpenChange(false);
  };

  const getMaxDate = () => {
    return projectDeadline ? new Date(projectDeadline) : undefined;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background dark:bg-card border border-border dark:border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-foreground flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            Edit Task
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
            Update task details including title, description, importance level, and deadline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {projectDeadline && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Project deadline: {format(new Date(projectDeadline), "PPP")}. Task deadline cannot be later than this date.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-task-title" className="text-sm font-medium text-foreground">
              Task Title *
            </Label>
            <Input
              id="edit-task-title"
              type="text"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary"
              maxLength={500}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="edit-task-description"
              placeholder="Describe the task objectives and requirements..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary min-h-[80px] resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Importance Level
            </Label>
            <Select
              value={formData.importanceLevel}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, importanceLevel: value as 'low' | 'medium' | 'high' | 'critical' }))
              }
            >
              <SelectTrigger 
                className={cn(
                  "bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <SelectValue placeholder="Select importance level *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Deadline *
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
                  {formData.deadline ? format(formData.deadline, "PPP") : "Select deadline *"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background dark:bg-card border border-border dark:border-border">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                  disabled={(date) => {
                    const today = new Date();
                    const maxDate = getMaxDate();
                    if (date < today) return true;
                    if (maxDate && date > maxDate) return true;
                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.importanceLevel || !formData.deadline}
              className="flex-1 bg-primary hover:bg-[#006666] text-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 