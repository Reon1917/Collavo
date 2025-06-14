import { Member, SubTask } from '../../../types';

export interface SubTaskDetailsDialogProps {
  subTask: SubTask;
  currentUserId: string;
  isProjectLeader: boolean;
  userPermissions: string[];
  projectId: string;
  mainTaskId: string;
  mainTaskDeadline: string | null;
  projectDeadline: string | null;
  members: Member[];
  onSubTaskUpdated?: (updatedSubTask: Partial<SubTask> & { id: string }) => void;
  onSubTaskDeleted?: (subtaskId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface StatusFormData {
  status: 'pending' | 'in_progress' | 'completed';
  note: string;
}

export interface DetailsFormData {
  title: string;
  description: string;
  assignedId: string;
  deadline: Date | undefined;
}

export type EditMode = 'view' | 'status' | 'details';

export interface SubTaskPermissions {
  canUpdateStatus: boolean;
  canEditDetails: boolean;
} 