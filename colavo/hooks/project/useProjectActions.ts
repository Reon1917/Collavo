import { useState } from 'react';
import { toast } from 'sonner';

interface EditFormData {
  name: string;
  description: string;
  deadline: Date | undefined;
}

interface UseProjectActionsReturn {
  isEditLoading: boolean;
  isDeleteLoading: boolean;
  editFormData: EditFormData;
  setEditFormData: (data: EditFormData) => void;
  updateProject: (projectId: string, data: EditFormData) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
}

export function useProjectActions(): UseProjectActionsReturn {
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    description: '',
    deadline: undefined
  });

  const updateProject = async (projectId: string, data: EditFormData): Promise<boolean> => {
    if (!data.name.trim()) {
      toast.error('Project name is required');
      return false;
    }

    setIsEditLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description.trim() || null,
          deadline: data.deadline ? data.deadline.toISOString() : null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      toast.success('Project updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project');
      return false;
    } finally {
      setIsEditLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      toast.success('Project deleted successfully!');
      window.location.href = '/dashboard';
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
      return false;
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return {
    isEditLoading,
    isDeleteLoading,
    editFormData,
    setEditFormData,
    updateProject,
    deleteProject,
  };
} 