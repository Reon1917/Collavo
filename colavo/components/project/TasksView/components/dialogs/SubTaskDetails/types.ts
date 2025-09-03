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
  status?: 'pending' | 'in_progress' | 'completed';
  note?: string;
}

export type EditMode = 'view' | 'status' | 'details';

// Modal modes based on user capabilities
export type ModalMode = 'view-only' | 'status-update' | 'full-edit' | 'management';

export interface SubTaskPermissions {
  canUpdateStatus: boolean;
  canEditDetails: boolean;
}

export interface SubTaskCapabilities {
  modalMode: ModalMode;
  permissions: SubTaskPermissions;
  actionText: string;
  canDelete: boolean;
  showAdvancedActions: boolean;
} 