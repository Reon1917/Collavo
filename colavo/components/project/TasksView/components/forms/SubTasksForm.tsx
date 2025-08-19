import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MemberSelect } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Member } from '../../types';

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

interface SubTasksFormProps {
  projectId: string;
  mainTaskId: string;
  mainTaskData: MainTaskFormData;
  subTasks: SubTaskFormData[];
  setSubTasks: (tasks: SubTaskFormData[] | ((prev: SubTaskFormData[]) => SubTaskFormData[])) => void;
  members: Member[];
  createdMainTask: any;
  onFinish: (taskWithSubTasks?: any) => void;
  onBack: () => void;
}

export function SubTasksForm({
  projectId,
  mainTaskId,
  mainTaskData,
  subTasks,
  setSubTasks,
  members,
  createdMainTask,
  onFinish,
  onBack
}: SubTasksFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  const validateSubTasks = () => {
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

    if (mainTaskData.deadline) {
      const invalidDeadlines = validSubTasks.filter(st => st.deadline && st.deadline > mainTaskData.deadline!);
      if (invalidDeadlines.length > 0) {
        toast.error('Subtask deadlines cannot be later than the main task deadline');
        return false;
      }
    }

    return true;
  };

  const handleCreateSubTasks = async () => {
    if (!validateSubTasks()) {
      return;
    }

    const validSubTasks = subTasks.filter(st => st.title.trim());
    setIsLoading(true);

    try {
      const subTaskPromises = validSubTasks.map(subTask => 
        fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks`, {
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

      const responses = await Promise.all(subTaskPromises);
      
      const failedRequests = responses.filter(response => !response.ok);
      if (failedRequests.length > 0) {
        throw new Error(`Failed to create ${failedRequests.length} sub-task(s)`);
      }

      const createdSubTasks = await Promise.all(
        responses.map(response => response.json())
      );

      toast.success(`Created ${validSubTasks.length} sub-task(s) successfully!`);
      
      const completeTask = {
        ...createdMainTask,
        subTasks: createdSubTasks
      };
      
      onFinish(completeTask);
    } catch {
      toast.error('Failed to create sub-tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubTaskMaxDate = () => {
    if (mainTaskData.deadline) {
      return mainTaskData.deadline;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {subTasks.map((subTask, index) => (
          <Card key={index} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Sub-task {index + 1} *
                </CardTitle>
                {subTasks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSubTask(index)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Sub-task title... *"
                  value={subTask.title}
                  onChange={(e) => handleSubTaskChange(index, 'title', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                  maxLength={500}
                  required
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Sub-task description..."
                  value={subTask.description}
                  onChange={(e) => handleSubTaskChange(index, 'description', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 min-h-[60px] resize-none"
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
          className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#008080] hover:text-[#008080] py-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Sub-task
        </Button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          Back to Main Task
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
  );
} 