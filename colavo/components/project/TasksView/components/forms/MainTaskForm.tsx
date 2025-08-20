import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MainTaskFormData {
  title: string;
  description: string;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date | undefined;
}

interface MainTaskFormProps {
  projectId: string;
  mainTaskData: MainTaskFormData;
  setMainTaskData: (data: MainTaskFormData | ((prev: MainTaskFormData) => MainTaskFormData)) => void;
  projectData?: { deadline: string | null };
  onSuccess: (task: any, taskId: string) => void;
  onCancel: () => void;
}

export function MainTaskForm({ 
  projectId, 
  mainTaskData, 
  setMainTaskData, 
  projectData, 
  onSuccess, 
  onCancel 
}: MainTaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const projectDeadline = projectData?.deadline ? new Date(projectData.deadline) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mainTaskData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!mainTaskData.importanceLevel) {
      toast.error('Please select an importance level');
      return;
    }

    if (!mainTaskData.deadline) {
      toast.error('Deadline is required for all tasks');
      return;
    }

    // Validate deadline against project deadline
    if (projectDeadline && mainTaskData.deadline > projectDeadline) {
      toast.error('Task deadline cannot be later than project deadline');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: mainTaskData.title.trim(),
          description: mainTaskData.description.trim() || null,
          importanceLevel: mainTaskData.importanceLevel,
          deadline: mainTaskData.deadline.toISOString()
        }),
      });

      if (response.ok) {
        const task = await response.json();
        toast.success('Main task created successfully!');
        onSuccess(task, task.id);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create task');
      }
    } catch {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxDate = () => {
    return projectDeadline || undefined;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {projectDeadline && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Project deadline: {format(projectDeadline, "PPP")}. Task deadline cannot be later than this date.
          </p>
        </div>
      )}

      {/* Task Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Task Title *
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter task title..."
          value={mainTaskData.title}
          onChange={(e) => setMainTaskData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-background border-border focus:bg-card focus:border-primary"
          maxLength={500}
          required
          disabled={isLoading}
        />
      </div>

      {/* Task Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the task objectives and requirements..."
          value={mainTaskData.description}
          onChange={(e) => setMainTaskData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-background border-border focus:bg-card focus:border-primary min-h-[80px] resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Importance Level */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Importance Level
        </Label>
        <Select
          value={mainTaskData.importanceLevel}
          onValueChange={(value) => 
            setMainTaskData(prev => ({ ...prev, importanceLevel: value as 'low' | 'medium' | 'high' | 'critical' }))
          }
        >
          <SelectTrigger 
            className={cn(
              "bg-background border-border focus:bg-card focus:border-primary",
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

      {/* Deadline */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Deadline *
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-background border-border hover:bg-card hover:border-primary",
                !mainTaskData.deadline && "text-gray-500 dark:text-gray-400"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {mainTaskData.deadline ? format(mainTaskData.deadline, "PPP") : "Select deadline *"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <Calendar
              mode="single"
              selected={mainTaskData.deadline}
              onSelect={(date) => setMainTaskData(prev => ({ ...prev, deadline: date }))}
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !mainTaskData.title.trim() || !mainTaskData.importanceLevel || !mainTaskData.deadline}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Task'
          )}
        </Button>
      </div>
    </form>
  );
} 