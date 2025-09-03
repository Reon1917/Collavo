import { useState } from 'react';
import { toast } from 'sonner';
import { StatusFormData, DetailsFormData } from '../types';
import { SubTask } from '../../../../types';
import { validateDeadline } from '../utils';

export function useSubTaskActions(
  projectId: string,
  mainTaskId: string,
  mainTaskDeadline: string | null,
  projectDeadline: string | null
) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateStatus = async (
    subTaskId: string,
    currentSubTask: SubTask,
    formData: StatusFormData,
    onSuccess: (updatedData: Partial<SubTask> & { id: string }) => void
  ) => {
    const statusChanged = formData.status !== currentSubTask.status;
    const noteChanged = formData.note.trim() !== (currentSubTask.note || '');
    
    if (!statusChanged && !noteChanged) {
      toast.error('No changes made to save');
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks/${subTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          note: formData.note.trim() || null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subtask');
      }

      toast.success('Subtask updated successfully!');
      onSuccess({ 
        id: subTaskId, 
        status: formData.status, 
        note: formData.note.trim() || null 
      });
      return true;
    } catch {
      toast.error('Failed to update subtask');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDetails = async (
    subTaskId: string,
    formData: DetailsFormData,
    onSuccess: (updatedData: Partial<SubTask> & { id: string }) => void
  ) => {
    if (!formData.title.trim()) {
      toast.error('Subtask title is required');
      return false;
    }

    if (!formData.assignedId) {
      toast.error('Subtask must be assigned to a member');
      return false;
    }

    if (!formData.deadline) {
      toast.error('Deadline is required');
      return false;
    }

    const deadlineError = validateDeadline(formData.deadline, mainTaskDeadline, projectDeadline);
    if (deadlineError) {
      toast.error(deadlineError);
      return false;
    }

    setIsLoading(true);

    try {
      // Build the update object - include status and note if they exist (management mode)
      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        assignedId: formData.assignedId,
        deadline: formData.deadline.toISOString()
      };

      // Include status and note if provided (management mode)
      if (formData.status !== undefined) {
        updateData.status = formData.status;
      }
      if (formData.note !== undefined) {
        updateData.note = formData.note.trim() || null;
      }

      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks/${subTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subtask details');
      }

      toast.success('Subtask updated successfully!');
      
      // Build the success response object
      const successData: any = {
        id: subTaskId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        assignedId: formData.assignedId,
        deadline: formData.deadline.toISOString()
      };

      // Include status and note in success callback if they were updated
      if (formData.status !== undefined) {
        successData.status = formData.status;
      }
      if (formData.note !== undefined) {
        successData.note = formData.note.trim() || null;
      }

      onSuccess(successData);
      return true;
    } catch {
      toast.error('Failed to update subtask');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubTask = async (
    subTaskId: string,
    onSuccess: (deletedId: string) => void
  ) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks/${subTaskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subtask');
      }

      toast.success('Subtask deleted successfully!');
      onSuccess(subTaskId);
      return true;
    } catch {
      toast.error('Failed to delete subtask');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isLoading,
    isDeleting,
    updateStatus,
    updateDetails,
    deleteSubTask
  };
} 