"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, Plus, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateTaskFormProps {
  projectId: string;
  onTaskCreated?: () => void;
  members: Member[];
  trigger?: React.ReactNode;
}

interface Member {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'leader' | 'member';
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

export function CreateTaskForm({ projectId, onTaskCreated, members, trigger }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'main' | 'sub'>('main');
  const [createdMainTaskId, setCreatedMainTaskId] = useState<string | null>(null);
  
  const [mainTaskData, setMainTaskData] = useState<MainTaskFormData>({
    title: '',
    description: '',
    importanceLevel: 'medium',
    deadline: undefined
  });

  const [subTasks, setSubTasks] = useState<SubTaskFormData[]>([]);

  const handleMainTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mainTaskData.title.trim()) {
      toast.error('Task title is required');
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
          deadline: mainTaskData.deadline ? mainTaskData.deadline.toISOString() : null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      const task = await response.json();
      setCreatedMainTaskId(task.id);
      toast.success('Main task created successfully!');
      
      // Move to sub-task creation step
      setStep('sub');
    } catch (error) {
      console.error('Error creating main task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
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
    setSubTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubTaskChange = (index: number, field: keyof SubTaskFormData, value: string | Date | undefined) => {
    setSubTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const handleCreateSubTasks = async () => {
    const validSubTasks = subTasks.filter(st => st.title.trim());
    
    if (validSubTasks.length === 0) {
      handleFinish();
      return;
    }

    setIsLoading(true);

    try {
      // Create all sub-tasks
      const subTaskPromises = validSubTasks.map(subTask => 
        fetch(`/api/projects/${projectId}/tasks/${createdMainTaskId}/subtasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: subTask.title.trim(),
            description: subTask.description.trim() || null,
            assignedId: subTask.assignedId || null,
            deadline: subTask.deadline ? subTask.deadline.toISOString() : null
          }),
        })
      );

      const responses = await Promise.all(subTaskPromises);
      
      // Check if all requests were successful
      const failedRequests = responses.filter(response => !response.ok);
      if (failedRequests.length > 0) {
        throw new Error(`Failed to create ${failedRequests.length} sub-task(s)`);
      }

      toast.success(`Created ${validSubTasks.length} sub-task(s) successfully!`);
      handleFinish();
    } catch (error) {
      console.error('Error creating sub-tasks:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create sub-tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Reset form
    setMainTaskData({
      title: '',
      description: '',
      importanceLevel: 'medium',
      deadline: undefined
    });
    setSubTasks([]);
    setStep('main');
    setCreatedMainTaskId(null);
    setIsOpen(false);
    
    // Trigger refresh
    onTaskCreated?.();
  };

  const defaultTrigger = (
    <>
      <Plus className="h-4 w-4 mr-2" />
      Create Task
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white rounded-md font-medium transition-colors">
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#008080]" />
            {step === 'main' ? 'Create New Task' : 'Add Sub-tasks (Optional)'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {step === 'main' 
              ? 'Create a main task to organize your project work.'
              : 'Break down your main task into smaller, assignable sub-tasks.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'main' ? (
          <form onSubmit={handleMainTaskSubmit} className="space-y-6">
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
                className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
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
                className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] min-h-[80px] resize-none"
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
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setMainTaskData(prev => ({ ...prev, importanceLevel: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
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
                Deadline (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:border-[#008080] dark:hover:border-[#00FFFF]",
                      !mainTaskData.deadline && "text-gray-500 dark:text-gray-400"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {mainTaskData.deadline ? format(mainTaskData.deadline, "PPP") : "Select deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <Calendar
                    mode="single"
                    selected={mainTaskData.deadline}
                    onSelect={(date) => setMainTaskData(prev => ({ ...prev, deadline: date }))}
                    disabled={(date) => date < new Date()}
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
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !mainTaskData.title.trim()}
                className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
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
        ) : (
          <div className="space-y-6">
            {/* Sub-tasks */}
            <div className="space-y-4">
              {subTasks.map((subTask, index) => (
                <Card key={index} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                        Sub-task {index + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubTask(index)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Sub-task Title */}
                    <Input
                      placeholder="Sub-task title..."
                      value={subTask.title}
                      onChange={(e) => handleSubTaskChange(index, 'title', e.target.value)}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                      maxLength={500}
                    />

                    {/* Sub-task Description */}
                    <Textarea
                      placeholder="Sub-task description..."
                      value={subTask.description}
                      onChange={(e) => handleSubTaskChange(index, 'description', e.target.value)}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 min-h-[60px] resize-none"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {/* Assigned Member */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Assign to
                        </Label>
                        <Select
                          value={subTask.assignedId}
                          onValueChange={(value) => handleSubTaskChange(index, 'assignedId', value)}
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900">
                            <SelectItem value="">Unassigned</SelectItem>
                            {members.map((member) => (
                              <SelectItem key={member.userId} value={member.userId}>
                                {member.userName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Deadline */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Deadline
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-xs",
                                !subTask.deadline && "text-gray-500"
                              )}
                            >
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {subTask.deadline ? format(subTask.deadline, "MMM dd") : "Set date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                            <Calendar
                              mode="single"
                              selected={subTask.deadline}
                              onSelect={(date) => handleSubTaskChange(index, 'deadline', date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Sub-task Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubTask}
                className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#008080] hover:text-[#008080]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sub-task
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleFinish}
                disabled={isLoading}
                className="flex-1"
              >
                Skip Sub-tasks
              </Button>
              <Button
                type="button"
                onClick={handleCreateSubTasks}
                disabled={isLoading}
                className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Finish Task'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 