"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MemberSelect } from '../shared';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Loader2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Member, SubTask } from '../../types';

interface CreateSubTaskFormProps {
  projectId: string;
  mainTaskId: string;
  mainTaskDeadline: string | null;
  projectDeadline: string | null;
  onSubTaskCreated?: (newSubTask: SubTask) => void;
  members: Member[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SubTaskFormData {
  title: string;
  description: string;
  assignedId: string;
  deadline: Date | undefined;
}

export function CreateSubTaskForm({ 
  projectId, 
  mainTaskId, 
  mainTaskDeadline, 
  projectDeadline, 
  onSubTaskCreated, 
  members, 
  trigger, 
  open, 
  onOpenChange 
}: CreateSubTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;
  
  const [formData, setFormData] = useState<SubTaskFormData>({
    title: '',
    description: '',
    assignedId: '',
    deadline: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Subtask title is required');
      return;
    }

    if (!formData.assignedId) {
      toast.error('Subtask must be assigned to a member');
      return;
    }

    if (!formData.deadline) {
      toast.error('Deadline is required for all subtasks');
      return;
    }

    if (mainTaskDeadline && formData.deadline > new Date(mainTaskDeadline)) {
      toast.error('Subtask deadline cannot be later than the main task deadline');
      return;
    }

    if (projectDeadline && formData.deadline > new Date(projectDeadline)) {
      toast.error('Subtask deadline cannot be later than the project deadline');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          assignedId: formData.assignedId,
          deadline: formData.deadline.toISOString()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subtask');
      }

      const newSubTask = await response.json();
      toast.success('Subtask created successfully!');
      
      setFormData({
        title: '',
        description: '',
        assignedId: '',
        deadline: undefined
      });
      setDialogOpen(false);
      
      onSubTaskCreated?.(newSubTask);
    } catch {
      toast.error('Failed to create subtask');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxDate = () => {
    const dates = [mainTaskDeadline, projectDeadline].filter(Boolean).map(d => new Date(d!));
    if (dates.length === 0) return undefined;
    return new Date(Math.min(...dates.map(d => d.getTime())));
  };

  const defaultTrigger = (
    <>
      <Plus className="h-3 w-3 mr-1" />
      Add Subtask
    </>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {(trigger !== undefined || open === undefined) && (
        <DialogTrigger className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-primary border border-primary hover:bg-primary hover:text-primary-foreground rounded-md font-medium transition-colors">
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Subtask
          </DialogTitle>
          <DialogDescription>
            Create a new subtask that must be assigned to a team member with a deadline.
            You can set up email reminders after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(mainTaskDeadline || projectDeadline) && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {mainTaskDeadline && (
                  <p>Main task deadline: {format(new Date(mainTaskDeadline), "PPP")}</p>
                )}
                {projectDeadline && (
                  <p>Project deadline: {format(new Date(projectDeadline), "PPP")}</p>
                )}
                <p className="font-medium">Subtask deadline cannot exceed either deadline.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Subtask Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter subtask title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary"
              maxLength={500}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter subtask description (optional)..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary resize-none min-h-[80px]"
              maxLength={1000}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Assign To *
            </Label>
            <MemberSelect
              members={members}
              value={formData.assignedId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignedId: value }))}
              placeholder="Select a team member *"
              className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Deadline *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background dark:bg-muted border-border dark:border-border",
                    !formData.deadline && "text-muted-foreground dark:text-muted-foreground",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, "PPP") : "Select deadline *"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.assignedId || !formData.deadline}
              className="flex-1 bg-primary hover:bg-[#006666] text-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Subtask'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 