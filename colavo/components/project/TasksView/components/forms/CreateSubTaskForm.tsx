"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Loader2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Member, SubTask } from '../../types';
import { NotificationSettings } from '../../../shared/ui/NotificationSettings';

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
  notificationSettings: {
    daysBefore: number;
    notificationTime: string;
  };
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
    deadline: undefined,
    notificationSettings: {
      daysBefore: 1,
      notificationTime: "09:00"
    }
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

    // Validation for notification settings is handled by the notification component

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
          deadline: formData.deadline.toISOString(),
          notificationSettings: formData.notificationSettings
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subtask');
      }

      const newSubTask = await response.json();
      
      if (newSubTask.notification?.scheduled) {
        toast.success(`Subtask created successfully! Notification scheduled for ${formData.notificationSettings.daysBefore} day(s) before deadline.`);
      } else {
        toast.success('Subtask created successfully!');
      }
      
      setFormData({
        title: '',
        description: '',
        assignedId: '',
        deadline: undefined,
        notificationSettings: {
          daysBefore: 1,
          notificationTime: "09:00"
        }
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
        <DialogTrigger className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-[#008080] border border-[#008080] hover:bg-[#008080] hover:text-white rounded-md font-medium transition-colors">
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#008080]" />
            Add New Subtask
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Create a new subtask that must be assigned to a team member with a deadline.
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
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Subtask Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter subtask title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
              maxLength={500}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the subtask requirements..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] min-h-[80px] resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign to *
              </Label>
              <Select
                value={formData.assignedId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedId: value }))}
              >
                <SelectTrigger 
                  className={cn(
                    "bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <SelectValue placeholder="Select member *" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Deadline *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:border-[#008080] dark:hover:border-[#00FFFF]",
                      !formData.deadline && "text-gray-500 dark:text-gray-400",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, "PPP") : "Select deadline *"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
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
          </div>

          <NotificationSettings
            type="subtask"
            settings={formData.notificationSettings}
            onSettingsChange={(settings) => setFormData(prev => ({ ...prev, notificationSettings: settings }))}
            hasDeadline={!!formData.deadline}
            hasAssignee={!!formData.assignedId}
            disabled={isLoading}
          />

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
              className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
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