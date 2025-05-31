"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, User, Calendar as CalendarIcon2, Clock, Edit3, Eye, Settings, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SubTaskDetailsDialogProps {
  subTask: SubTask;
  currentUserId: string;
  isProjectLeader: boolean;
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

interface Member {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  userName: string;
  userEmail: string;
  userImage: string | null;
}

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

export function SubTaskDetailsDialog({
  subTask,
  currentUserId,
  isProjectLeader,
  projectId,
  mainTaskId,
  mainTaskDeadline,
  projectDeadline,
  members,
  onSubTaskUpdated,
  onSubTaskDeleted,
  isOpen,
  onOpenChange
}: SubTaskDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState<'view' | 'status' | 'details'>('view');
  
  const [statusFormData, setStatusFormData] = useState({
    status: subTask.status,
    note: subTask.note || ''
  });

  const [detailsFormData, setDetailsFormData] = useState({
    title: subTask.title,
    description: subTask.description || '',
    assignedId: subTask.assignedId || '',
    deadline: subTask.deadline ? new Date(subTask.deadline) : undefined
  });

  // Check if current user can edit status/notes (is assignee or project leader)
  const canUpdateStatus = currentUserId === subTask.assignedId || isProjectLeader;
  
  // Check if current user can edit details (project leader only)
  const canEditDetails = isProjectLeader;

  // Reset form data when subtask changes or dialog opens
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

  // Handle dialog close and reset state
  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setEditMode('view');
      setShowDeleteDialog(false);
    }
  };

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

  const getMaxDate = () => {
    const dates = [mainTaskDeadline, projectDeadline].filter(Boolean).map(d => new Date(d!));
    if (dates.length === 0) return undefined;
    return new Date(Math.min(...dates.map(d => d.getTime())));
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canUpdateStatus) {
      toast.error('You do not have permission to update this subtask');
      return;
    }

    // Check if anything actually changed
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
      onSubTaskUpdated?.({ id: subTask.id, status: statusFormData.status, note: statusFormData.note.trim() || null });
    } catch {
      toast.error('Failed to update subtask');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
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

    // Validate deadline against constraints
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
      onSubTaskUpdated?.({ id: subTask.id, title: detailsFormData.title.trim(), description: detailsFormData.description.trim() || null, assignedId: detailsFormData.assignedId, deadline: detailsFormData.deadline.toISOString() });
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

  const handleDeleteSubtask = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${mainTaskId}/subtasks/${subTask.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subtask');
      }

      toast.success('Subtask deleted successfully!');
      setShowDeleteDialog(false);
      handleDialogClose(false);
      onSubTaskDeleted?.(subTask.id);
    } catch {
      toast.error('Failed to delete subtask');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {editMode === 'status' ? (
                    <>
                      <Edit3 className="h-5 w-5 text-[#008080]" />
                      Update Status & Notes
                    </>
                  ) : editMode === 'details' ? (
                    <>
                      <Settings className="h-5 w-5 text-[#008080]" />
                      Edit Subtask Details
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 text-[#008080]" />
                      Subtask Details
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  {editMode === 'status' 
                    ? 'Update the status and add notes about your progress.'
                    : editMode === 'details'
                    ? 'Edit subtask details including title, deadline, and assignment.'
                    : 'View and manage subtask details and progress.'
                  }
                </DialogDescription>
              </div>
              
              {editMode === 'view' && (
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(subTask.status)} border`}
                  >
                    {getStatusLabel(subTask.status)}
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {editMode === 'details' ? (
              /* Details Edit Form */
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                {(mainTaskDeadline || projectDeadline) && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      {mainTaskDeadline && (
                        <p>Main task deadline: {format(new Date(mainTaskDeadline), "PPP")}</p>
                      )}
                      {projectDeadline && (
                        <p>Project deadline: {format(new Date(projectDeadline), "PPP")}</p>
                      )}
                      <p className="font-medium">Subtask deadline cannot exceed either deadline.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title *
                    </Label>
                    <Input
                      id="edit-title"
                      value={detailsFormData.title}
                      onChange={(e) => setDetailsFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assign to *
                    </Label>
                    <Select
                      value={detailsFormData.assignedId}
                      onValueChange={(value) => setDetailsFormData(prev => ({ ...prev, assignedId: value }))}
                    >
                      <SelectTrigger 
                        className={cn(
                          "bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <SelectValue placeholder="Select member *" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            {member.userName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={detailsFormData.description}
                    onChange={(e) => setDetailsFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 min-h-[100px] resize-none"
                    disabled={isLoading}
                    placeholder="Describe the subtask requirements and objectives..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deadline *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700",
                          !detailsFormData.deadline && "text-gray-500 dark:text-gray-400",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {detailsFormData.deadline ? format(detailsFormData.deadline, "PPP") : "Select deadline *"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <Calendar
                        mode="single"
                        selected={detailsFormData.deadline}
                        onSelect={(date) => setDetailsFormData(prev => ({ ...prev, deadline: date }))}
                        disabled={(date) => {
                          const today = new Date();
                          const maxDate = getMaxDate();
                          if (date < today) return true;
                          if (maxDate && date > maxDate) return true;
                          return false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDetailsCancel}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* View/Status Update Mode */
              <>
                {/* Subtask Info Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{subTask.title}</h3>
                  </div>

                  {subTask.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{subTask.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned to</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {subTask.assignedUserName || 'Unassigned'}
                          {subTask.assignedUserName === currentUserId && (
                            <span className="text-[#008080] ml-1">(You)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {subTask.deadline && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <CalendarIcon2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">
                            {format(new Date(subTask.deadline), 'PPP')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {format(new Date(subTask.createdAt), 'PPP')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Note Form */}
                <form onSubmit={handleStatusSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                      {editMode === 'status' ? (
                        <Select
                          value={statusFormData.status}
                          onValueChange={(value) => 
                            setStatusFormData(prev => ({ ...prev, status: value as 'pending' | 'in_progress' | 'completed' }))
                          }
                        >
                          <SelectTrigger className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(subTask.status)} border text-sm px-3 py-1`}
                          >
                            {getStatusLabel(subTask.status)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress Notes {editMode === 'status' && <span className="text-gray-500">(Optional)</span>}
                      </Label>
                      {editMode === 'status' ? (
                        <Textarea
                          placeholder="Add notes about your progress, challenges, or updates..."
                          value={statusFormData.note}
                          onChange={(e) => setStatusFormData(prev => ({ ...prev, note: e.target.value }))}
                          className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] min-h-[120px] resize-none"
                          disabled={isLoading}
                        />
                      ) : (
                        <div className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                          {subTask.note ? (
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{subTask.note}</p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-500 italic">No progress notes added yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {editMode === 'view' ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDialogClose(false)}
                          className="flex-1"
                          disabled={isDeleting}
                        >
                          Close
                        </Button>
                        <div className="flex gap-2 flex-1">
                          {canUpdateStatus && (
                            <Button
                              type="button"
                              onClick={() => setEditMode('status')}
                              className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
                              disabled={isDeleting}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Update Status
                            </Button>
                          )}
                          {canEditDetails && (
                            <Button
                              type="button"
                              onClick={() => setEditMode('details')}
                              variant="outline"
                              className="flex-1"
                              disabled={isDeleting}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Edit Details
                            </Button>
                          )}
                          {canEditDetails && (
                            <Button
                              type="button"
                              onClick={() => setShowDeleteDialog(true)}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleStatusCancel}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Save Update'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Subtask"
        description="Are you sure you want to delete this subtask? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteSubtask}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
} 