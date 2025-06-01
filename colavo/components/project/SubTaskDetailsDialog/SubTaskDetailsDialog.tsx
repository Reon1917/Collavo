"use client";

import React from 'react'; // Removed useState, useEffect as they are moved to children
import { Dialog, DialogContent } from '@/components/ui/dialog';
// Most other specific UI imports (Button, Input, Textarea, Label, Select, Badge, Calendar, Popover, Icons, ConfirmationDialog, toast, format, cn)
// are now handled by the child components (Leader or Assignee views).
import { SubTaskDetailsDialogLeader, SubTaskDetailsDialogLeaderProps } from './leader/SubTaskDetailsDialogLeader';
import { SubTaskDetailsDialogAssignee, SubTaskDetailsDialogAssigneeProps } from './member/SubTaskDetailsDialogAssignee';
import type { SubTask as FullSubTask, Member as FullMember } from '../types'; // Import full types

// Keep original props interface as it defines the contract for this wrapper
export interface SubTaskDetailsDialogProps {
  subTask: FullSubTask; // Use imported FullSubTask
  currentUserId: string;
  isProjectLeader: boolean;
  projectId: string;
  mainTaskId: string;
  mainTaskDeadline: string | null;
  projectDeadline: string | null;
  members: FullMember[]; // Use imported FullMember
  onSubTaskUpdated?: (updatedSubTask: Partial<FullSubTask> & { id: string }) => void;
  onSubTaskDeleted?: (subtaskId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Local minimal types are no longer needed as props uses FullSubTask for subTask.assignedId.
// interface Member { userId: string; }
// interface SubTask { id: string; assignedId: string | null; }

export function SubTaskDetailsDialog(props: SubTaskDetailsDialogProps) {
  const {
    isOpen,
    onOpenChange,
    subTask,
    isProjectLeader,
    currentUserId,
    // Spread other props to children
    ...restProps
  } = props;

  // Handle dialog close, can remain here or be passed if children need to close it too.
  // For now, child components will call a `requestClose` prop.
  const handleDialogClose = () => {
    onOpenChange(false);
  };

  const leaderProps: SubTaskDetailsDialogLeaderProps = {
    ...restProps,
    subTask,
    requestClose: handleDialogClose,
  };

  const assigneeProps: SubTaskDetailsDialogAssigneeProps = {
    ...restProps,
    subTask,
    currentUserId, // Assignee component needs this to verify if it's the actual assignee
    requestClose: handleDialogClose,
    effectiveCanUpdateStatus: true, // Default to true, assignee component will double check
  };

  const nonAssigneeMemberProps: SubTaskDetailsDialogAssigneeProps = {
    ...restProps,
    subTask,
    currentUserId,
    requestClose: handleDialogClose,
    effectiveCanUpdateStatus: false, // Non-assignee members cannot update status
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        {isProjectLeader ? (
          <SubTaskDetailsDialogLeader {...leaderProps} />
        ) : currentUserId === subTask.assignedId ? (
          <SubTaskDetailsDialogAssignee {...assigneeProps} />
        ) : (
          // Fallback for a member who is not the assignee and not a leader
          // Render Assignee view but with status updates disabled
          <SubTaskDetailsDialogAssignee {...nonAssigneeMemberProps} />
        )}
      </DialogContent>
    </Dialog>
  );
}