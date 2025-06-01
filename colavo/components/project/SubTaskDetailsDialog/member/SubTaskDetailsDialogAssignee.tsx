"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Calendar as CalendarIcon, Clock, Edit3, Eye, Loader2 } from 'lucide-react'; // Added Loader2
import { toast } from 'sonner';
import { format } from 'date-fns';
// cn was not used.
// Popover and CalendarComponent for date picking are removed as assignees don't edit deadlines.
import type { SubTask } from '../../../types'; // Adjusted path

// ----- Type Definitions are now imported from ../../../types -----
// Local SubTask definition removed.

export interface SubTaskDetailsDialogAssigneeProps {
  subTask: SubTask;
  currentUserId: string;
  projectId: string;
  mainTaskId: string;
  onSubTaskUpdated?: (updatedSubTask: Partial<SubTask> & { id: string }) => void;
  requestClose: () => void;
  // This prop helps parent decide if status update UI should be enabled at all
  // For example, a non-assignee member viewing another member's task.
  effectiveCanUpdateStatus: boolean;
}

export const SubTaskDetailsDialogAssignee: React.FC<SubTaskDetailsDialogAssigneeProps> = ({
  subTask,
  currentUserId,
  projectId,
  mainTaskId,
  onSubTaskUpdated,
  requestClose,
  effectiveCanUpdateStatus,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // Assignee mode: 'view' or 'status' (for updating status/notes)
  const [editMode, setEditMode] = useState<'view' | 'status'>('view');

  const [statusFormData, setStatusFormData] = useState({
    status: subTask.status,
    note: subTask.note || ''
  });

  // Actual permission to update is if this component is rendered AND current user is the assignee.
  const isCurrentUserAssigned = currentUserId === subTask.assignedId;
  // Final check for enabling status update functionality
  const canActuallyUpdateStatus = effectiveCanUpdateStatus && isCurrentUserAssigned;

  useEffect(() => {
    setStatusFormData({
      status: subTask.status,
      note: subTask.note || ''
    });
    setEditMode('view');
  }, [subTask]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canActuallyUpdateStatus) {
      toast.error('You do not have permission to update this subtask.');
      return;
    }
    const statusChanged = statusFormData.status !== subTask.status;
    const noteChanged = statusFormData.note.trim() !== (subTask.note || '');
    if (!statusChanged && !noteChanged) {
      toast.info('No changes made to save.');
      setEditMode('view');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks/${subTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusFormData.status, note: statusFormData.note.trim() || null }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to update subtask');
      toast.success('Subtask status updated!');
      setEditMode('view');
      onSubTaskUpdated?.({ id: subTask.id, status: statusFormData.status, note: statusFormData.note.trim() || null });
      requestClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subtask');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusCancel = () => {
    setStatusFormData({ status: subTask.status, note: subTask.note || '' });
    setEditMode('view');
  };

  return (
    <>
      <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {editMode === 'status' ? <><Edit3 className="h-5 w-5 text-[#008080]" />Update Status & Notes</>
                : <><Eye className="h-5 w-5 text-[#008080]" />Subtask Details</>}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
              {editMode === 'status' ? 'Update the status and add notes about your progress.'
                : `Assigned to: ${subTask.assignedUserName || 'Unassigned'}${subTask.assignedId === currentUserId ? " (You)" : ""}`}
            </DialogDescription>
          </div>
          {editMode === 'view' && (
            <Badge variant="outline" className={`${getStatusColor(subTask.status)} border`}>{getStatusLabel(subTask.status)}</Badge>
          )}
        </div>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Subtask Info Card (Always visible in 'view' or 'status' mode for assignee) */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div><Label>Title</Label><h3 className="text-lg font-semibold mt-1">{subTask.title}</h3></div>
          {subTask.description && <div><Label>Description</Label><p className="mt-1 leading-relaxed">{subTask.description}</p></div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div><Label>Assigned to</Label><div className="flex items-center gap-2 mt-1"><User className="h-4 w-4" /><span className="font-medium">{subTask.assignedUserName || 'Unassigned'}{subTask.assignedId === currentUserId && <span className="text-[#008080] ml-1">(You)</span>}</span></div></div>
            {subTask.deadline && <div><Label>Deadline</Label><div className="flex items-center gap-2 mt-1"><CalendarIcon className="h-4 w-4" /><span className="font-medium">{format(new Date(subTask.deadline), 'PPP')}</span></div></div>}
            <div><Label>Created</Label><div className="flex items-center gap-2 mt-1"><Clock className="h-4 w-4" /><span className="font-medium">{format(new Date(subTask.createdAt), 'PPP')}</span></div></div>
          </div>
        </div>

        {/* Status and Note Form */}
        <form onSubmit={handleStatusSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              {editMode === 'status' && canActuallyUpdateStatus ? (
                <Select value={statusFormData.status} onValueChange={(v) => setStatusFormData(prev => ({ ...prev, status: v as any }))} disabled={isLoading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                </Select>
              ) : <div className="flex items-center gap-2"><Badge variant="outline" className={`${getStatusColor(subTask.status)} border text-sm px-3 py-1`}>{getStatusLabel(subTask.status)}</Badge></div>}
            </div>
            <div className="space-y-2">
              <Label>Progress Notes {editMode === 'status' && canActuallyUpdateStatus && <span className="text-gray-500">(Optional)</span>}</Label>
              {editMode === 'status' && canActuallyUpdateStatus ?
                <Textarea placeholder="Add notes..." value={statusFormData.note} onChange={(e) => setStatusFormData(prev => ({ ...prev, note: e.target.value }))} disabled={isLoading} />
                : <div className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 border rounded-md">{subTask.note ? <p className="whitespace-pre-wrap leading-relaxed">{subTask.note}</p> : <p className="italic">No progress notes.</p>}</div>
              }
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            {editMode === 'view' ? (
              <>
                <Button type="button" variant="outline" onClick={requestClose} className="flex-1">Close</Button>
                {canActuallyUpdateStatus && (
                  <Button type="button" onClick={() => setEditMode('status')} className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"><Edit3 className="h-4 w-4 mr-2" />Update Status</Button>
                )}
              </>
            ) : ( // editMode === 'status'
              <>
                <Button type="button" variant="outline" onClick={handleStatusCancel} disabled={isLoading} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isLoading || !canActuallyUpdateStatus} className="flex-1 bg-[#008080] hover:bg-[#006666] text-white">
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                  ) : (
                    'Save Update'
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
};
