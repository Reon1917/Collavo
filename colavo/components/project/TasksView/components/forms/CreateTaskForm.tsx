"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberSelect } from '../shared/MemberSelect';
import { FileText, Plus, CalendarIcon, Loader2, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Task, Member } from '../../types';

interface CreateTaskFormProps {
  projectId: string;
  onTaskCreated?: (newTask: Task) => void;
  members: Member[];
  trigger?: React.ReactNode;
  projectData?: {
    deadline: string | null;
  };
}

interface MainTaskFormData {
  title: string;
  description: string;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date | undefined;
}

interface SubTaskFormData {
  title: string;
  description: string;
  assignedId: string;
  deadline: Date | undefined;
}

export function CreateTaskForm({ projectId, onTaskCreated, members, trigger, projectData }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  
  const [mainTaskData, setMainTaskData] = useState<MainTaskFormData>({
    title: '',
    description: '',
    importanceLevel: '' as any,
    deadline: undefined
  });

  const [subTasks, setSubTasks] = useState<SubTaskFormData[]>([{
    title: '',
    description: '',
    assignedId: '',
    deadline: undefined
  }]);

  const projectDeadline = projectData?.deadline ? new Date(projectData.deadline) : null;

  // Check if form has any data
  const hasFormData = () => {
    return (
      mainTaskData.title.trim() ||
      mainTaskData.description.trim() ||
      mainTaskData.importanceLevel ||
      mainTaskData.deadline ||
      subTasks.some(st => st.title.trim() || st.description.trim() || st.assignedId || st.deadline)
    );
  };

  // Handle modal close with unsaved changes warning
  const handleModalClose = (open: boolean) => {
    if (!open && hasFormData()) {
      setShowUnsavedWarning(true);
    } else {
      setIsOpen(open);
      if (!open) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setMainTaskData({
      title: '',
      description: '',
      importanceLevel: '' as any,
      deadline: undefined
    });
    setSubTasks([{
      title: '',
      description: '',
      assignedId: '',
      deadline: undefined
    }]);
  };

  const handleAddSubTask = () => {
    setSubTasks(prev => [...prev, {
      title: '',
      description: '',
      assignedId: '',
      deadline: undefined
    }]);
  };

  const handleRemoveSubTask = (index: number) => {
    if (subTasks.length > 1) {
      setSubTasks(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.error('At least one subtask is required');
    }
  };

  const handleSubTaskChange = (index: number, field: keyof SubTaskFormData, value: string | Date | undefined) => {
    setSubTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const validateForm = () => {
    // Validate main task
    if (!mainTaskData.title.trim()) {
      toast.error('Task title is required');
      return false;
    }

    if (!mainTaskData.importanceLevel) {
      toast.error('Please select an importance level');
      return false;
    }

    if (!mainTaskData.deadline) {
      toast.error('Deadline is required for all tasks');
      return false;
    }

    if (projectDeadline && mainTaskData.deadline > projectDeadline) {
      toast.error('Task deadline cannot be later than project deadline');
      return false;
    }

    // Validate subtasks
    const validSubTasks = subTasks.filter(st => st.title.trim());
    
    if (validSubTasks.length === 0) {
      toast.error('At least one subtask with a title is required');
      return false;
    }

    const unassignedSubTasks = validSubTasks.filter(st => !st.assignedId);
    if (unassignedSubTasks.length > 0) {
      toast.error('All subtasks must be assigned to a member');
      return false;
    }

    const missingDeadlines = validSubTasks.filter(st => !st.deadline);
    if (missingDeadlines.length > 0) {
      toast.error('All subtasks must have a deadline');
      return false;
    }

    const invalidDeadlines = validSubTasks.filter(st => st.deadline && st.deadline > mainTaskData.deadline!);
    if (invalidDeadlines.length > 0) {
      toast.error('Subtask deadlines cannot be later than the main task deadline');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create main task first
      const mainTaskResponse = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: mainTaskData.title.trim(),
          description: mainTaskData.description.trim() || null,
          importanceLevel: mainTaskData.importanceLevel,
          deadline: mainTaskData.deadline!.toISOString()
        }),
      });

      if (!mainTaskResponse.ok) {
        const errorData = await mainTaskResponse.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const createdMainTask = await mainTaskResponse.json();

      // Create all subtasks
      const validSubTasks = subTasks.filter(st => st.title.trim());
      const subTaskPromises = validSubTasks.map(subTask => 
        fetch(`/api/projects/${projectId}/tasks/${createdMainTask.id}/subtasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: subTask.title.trim(),
            description: subTask.description.trim() || null,
            assignedId: subTask.assignedId,
            deadline: subTask.deadline!.toISOString()
          }),
        })
      );

      const subTaskResponses = await Promise.all(subTaskPromises);
      
      const failedSubTasks = subTaskResponses.filter(response => !response.ok);
      if (failedSubTasks.length > 0) {
        throw new Error(`Failed to create ${failedSubTasks.length} sub-task(s)`);
      }

      const createdSubTasks = await Promise.all(
        subTaskResponses.map(response => response.json())
      );

      const completeTask = {
        ...createdMainTask,
        subTasks: createdSubTasks
      };

      toast.success(`Created task with ${validSubTasks.length} sub-task(s) successfully!`);
      
      resetForm();
      setIsOpen(false);
      onTaskCreated?.(completeTask);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxDate = () => {
    return projectDeadline || undefined;
  };

  const getSubTaskMaxDate = () => {
    if (mainTaskData.deadline) {
      return mainTaskData.deadline;
    }
    return undefined;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        {trigger ? (
          <div onClick={() => setIsOpen(true)}>
            {trigger}
          </div>
        ) : (
          <DialogTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </DialogTrigger>
        )}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Create New Task
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a main task and break it down into subtasks. All fields are required to ensure proper task distribution.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {projectDeadline && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Project deadline: {format(projectDeadline, "PPP")}. Task deadline cannot be later than this date.
                </p>
              </div>
            )}

            {/* Main Task Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Main Task Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Importance Level *
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
              </div>

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
            </div>

            {/* Subtasks Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Subtasks (At least 1 required)</h3>
              
              <div className="space-y-4">
                {subTasks.map((subTask, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                          Subtask {index + 1} *
                        </CardTitle>
                        {subTasks.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSubTask(index)}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Subtask title... *"
                          value={subTask.title}
                          onChange={(e) => handleSubTaskChange(index, 'title', e.target.value)}
                          className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                          maxLength={500}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Subtask description..."
                          value={subTask.description}
                          onChange={(e) => handleSubTaskChange(index, 'description', e.target.value)}
                          className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 min-h-[60px] resize-none"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Assign to *
                          </Label>
                          <MemberSelect
                            members={members}
                            value={subTask.assignedId}
                            onValueChange={(value) => handleSubTaskChange(index, 'assignedId', value)}
                            placeholder="Select member *"
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Deadline *
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-xs h-10",
                                  !subTask.deadline && "text-gray-500"
                                )}
                                disabled={isLoading}
                              >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {subTask.deadline ? format(subTask.deadline, "MMM dd") : "Set date *"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                              <Calendar
                                mode="single"
                                selected={subTask.deadline}
                                onSelect={(date) => handleSubTaskChange(index, 'deadline', date)}
                                disabled={(date) => {
                                  const today = new Date();
                                  const maxDate = getSubTaskMaxDate();
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
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSubTask}
                  className="w-full border-dashed border-2 border-border text-muted-foreground hover:border-primary hover:text-primary py-4"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Subtask
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleModalClose(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  'Create Task & Subtasks'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning Dialog */}
      <Dialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowUnsavedWarning(false)}
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowUnsavedWarning(false);
                setIsOpen(false);
                resetForm();
              }}
            >
              Discard Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 