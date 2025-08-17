"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus } from 'lucide-react';
import { MainTaskForm } from './MainTaskForm';
import { SubTasksForm } from './SubTasksForm';
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
  const [step, setStep] = useState<'main' | 'sub'>('main');
  const [createdMainTaskId, setCreatedMainTaskId] = useState<string | null>(null);
  const [createdMainTask, setCreatedMainTask] = useState<any>(null);
  
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

  const handleMainTaskSuccess = (task: any, taskId: string) => {
    setCreatedMainTaskId(taskId);
    setCreatedMainTask(task);
    setStep('sub');
  };

  const handleFinish = (taskWithSubTasks?: any) => {
    // Reset form
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
    setStep('main');
    setCreatedMainTaskId(null);
    setCreatedMainTask(null);
    setIsOpen(false);
    
    // Trigger optimistic update with complete task data
    if (taskWithSubTasks) {
      onTaskCreated?.(taskWithSubTasks);
    } else if (createdMainTask) {
      onTaskCreated?.({ ...createdMainTask, subTasks: [] });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        <DialogTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-[#006666] text-foreground rounded-md font-medium transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background dark:bg-card border border-border dark:border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {step === 'main' ? 'Create New Task' : 'Add Sub-tasks (Required)'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
            {step === 'main' 
              ? 'Create a main task to organize your project work. Deadline is required.'
              : 'Break down your main task into smaller, assignable sub-tasks. At least one subtask with an assigned member is required.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'main' ? (
          <MainTaskForm
            projectId={projectId}
            mainTaskData={mainTaskData}
            setMainTaskData={setMainTaskData}
            projectData={projectData || { deadline: null }}
            onSuccess={handleMainTaskSuccess}
            onCancel={() => setIsOpen(false)}
          />
        ) : (
          <SubTasksForm
            projectId={projectId}
            mainTaskId={createdMainTaskId!}
            mainTaskData={mainTaskData}
            subTasks={subTasks}
            setSubTasks={setSubTasks}
            members={members}
            createdMainTask={createdMainTask}
            onFinish={handleFinish}
            onBack={() => setStep('main')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 