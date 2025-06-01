import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SubTask {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  note: string | null;
  deadline: string | null;
  assignedId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
}

interface StatusFormData {
  status: string;
  note: string;
}

interface DetailsFormData {
  title: string;
  description: string;
  assignedId: string;
  deadline: Date | undefined;
}

interface UseSubTaskFormsReturn {
  editMode: 'view' | 'status' | 'details';
  setEditMode: (mode: 'view' | 'status' | 'details') => void;
  statusFormData: StatusFormData;
  setStatusFormData: (data: StatusFormData) => void;
  detailsFormData: DetailsFormData;
  setDetailsFormData: (data: DetailsFormData) => void;
  isLoading: boolean;
  resetForms: () => void;
  handleStatusSubmit: (e: React.FormEvent, projectId: string, mainTaskId: string, subTask: SubTask, onSubTaskUpdated?: (updatedSubTask: Partial<SubTask> & { id: string }) => void) => Promise<void>;
  handleDetailsSubmit: (e: React.FormEvent, projectId: string, mainTaskId: string, subTask: SubTask, mainTaskDeadline: string | null, projectDeadline: string | null, onSubTaskUpdated?: (updatedSubTask: Partial<SubTask> & { id: string }) => void) => Promise<void>;
  handleStatusCancel: () => void;
  handleDetailsCancel: () => void;
  getMaxDate: (mainTaskDeadline: string | null, projectDeadline: string | null) => Date | undefined;
}

export function useSubTaskForms(subTask: SubTask, isOpen: boolean, canUpdateStatus: boolean, canEditDetails: boolean): UseSubTaskFormsReturn {
  const [editMode, setEditMode] = useState<'view' | 'status' | 'details'>('view');
  const [isLoading, setIsLoading] = useState(false);
  
  const [statusFormData, setStatusFormData] = useState<StatusFormData>({
    status: subTask.status,
    note: subTask.note || ''
  });

  const [detailsFormData, setDetailsFormData] = useState<DetailsFormData>({
    title: subTask.title,
    description: subTask.description || '',
    assignedId: subTask.assignedId || '',
    deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
  });

  useEffect(() => {
    if (isOpen) {
      setStatusFormData({
        status: subTask.status,
        note: subTask.note || ''
      });
      setDetailsFormData({
        title: subTask.title,
        description: subTask.description || '',
        assignedId: subTask.assignedId || '',
        deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
      });
      setEditMode('view');
    }
  }, [subTask, isOpen]);

  const resetForms = () => {
    setStatusFormData({
      status: subTask.status,
      note: subTask.note || ''
    });
    setDetailsFormData({
      title: subTask.title,
      description: subTask.description || '',
      assignedId: subTask.assignedId || '',
      deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
    });
    setEditMode('view');
  };

  const getMaxDate = (mainTaskDeadline: string | null, projectDeadline: string | null): Date | undefined => {
    const dates = [mainTaskDeadline, projectDeadline].filter(Boolean).map(d => new Date(d!));
    if (dates.length === 0) return undefined;
    return new Date(Math.min(...dates.map(d => d.getTime())));
  };

  const handleStatusSubmit = async (
    e: React.FormEvent,
    projectId: string,
    mainTaskId: string,
    subTask: SubTask,
    onSubTaskUpdated?: (updatedSubTask: Partial<SubTask> & { id: string }) => void
  ): Promise<void> => {
    e.preventDefault();
    
    if (!canUpdateStatus) {
      toast.error('You do not have permission to update this subtask');
      return;
    }

    const statusChanged = statusFormData.status !== subTask.status;
    const noteChanged = statusFormData.note.trim() !== (subTask.note || '');
    
    if (!statusChanged && !noteChanged) {
      toast.error('No changes made to save');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks/${subTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusFormData.status,
          note: statusFormData.note.trim() || null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subtask');
      }

      toast.success('Subtask updated successfully!');
      setEditMode('view');
      onSubTaskUpdated?.({ 
        id: subTask.id, 
        status: statusFormData.status, 
        note: statusFormData.note.trim() || null 
      });
    } catch {
      toast.error('Failed to update subtask');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (
    e: React.FormEvent,
    projectId: string,
    mainTaskId: string,
    subTask: SubTask,
    mainTaskDeadline: string | null,
    projectDeadline: string | null,
    onSubTaskUpdated?: (updatedSubTask: Partial<SubTask> & { id: string }) => void
  ): Promise<void> => {
    e.preventDefault();
    
    if (!canEditDetails) {
      toast.error('You do not have permission to edit subtask details');
      return;
    }

    if (!detailsFormData.title.trim()) {
      toast.error('Subtask title is required');
      return;
    }

    if (!detailsFormData.assignedId) {
      toast.error('Subtask must be assigned to a member');
      return;
    }

    if (!detailsFormData.deadline) {
      toast.error('Deadline is required');
      return;
    }

    if (mainTaskDeadline && detailsFormData.deadline > new Date(mainTaskDeadline)) {
      toast.error('Subtask deadline cannot be later than the main task deadline');
      return;
    }

    if (projectDeadline && detailsFormData.deadline > new Date(projectDeadline)) {
      toast.error('Subtask deadline cannot be later than the project deadline');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks/${subTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: detailsFormData.title.trim(),
          description: detailsFormData.description.trim() || null,
          assignedId: detailsFormData.assignedId,
          deadline: detailsFormData.deadline.toISOString()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subtask details');
      }

      toast.success('Subtask details updated successfully!');
      setEditMode('view');
      onSubTaskUpdated?.({ 
        id: subTask.id, 
        title: detailsFormData.title.trim(), 
        description: detailsFormData.description.trim() || null, 
        assignedId: detailsFormData.assignedId, 
        deadline: detailsFormData.deadline.toISOString() 
      });
    } catch {
      toast.error('Failed to update subtask details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusCancel = () => {
    setStatusFormData({
      status: subTask.status,
      note: subTask.note || ''
    });
    setEditMode('view');
  };

  const handleDetailsCancel = () => {
    setDetailsFormData({
      title: subTask.title,
      description: subTask.description || '',
      assignedId: subTask.assignedId || '',
      deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
    });
    setEditMode('view');
  };

  return {
    editMode,
    setEditMode,
    statusFormData,
    setStatusFormData,
    detailsFormData,
    setDetailsFormData,
    isLoading,
    resetForms,
    handleStatusSubmit,
    handleDetailsSubmit,
    handleStatusCancel,
    handleDetailsCancel,
    getMaxDate,
  };
} 