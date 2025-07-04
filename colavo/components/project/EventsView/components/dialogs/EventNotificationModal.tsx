'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell, AlertCircle, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { createEventNotification } from '@/lib/actions/email-notifications';
import { TimePicker } from '@/components/ui/time-picker';
import { useHasActiveEventNotification, useCancelEventNotification } from '@/hooks/useEventNotifications';

interface EventNotificationModalProps {
  event: {
    id: string;
    title: string;
    datetime: string;
  };
  members: Array<{ 
    id: string; 
    userId: string; 
    role: 'leader' | 'member'; 
    userName: string; 
    userEmail: string; 
    userImage: string | null;
  }>;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventNotificationModal({ event, members, projectId, isOpen, onOpenChange }: EventNotificationModalProps) {
  const [notificationSettings, setNotificationSettings] = useState({
    daysBefore: '1',
    time: '09:00',
    recipientType: 'all' as 'all' | 'select',
    selectedMembers: [] as string[]
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Use React Query for notifications data
  const { 
    hasActiveNotification, 
    activeNotifications,
    notificationCount,
    isLoading
  } = useHasActiveEventNotification(projectId, event.id, isOpen);

  const cancelMutation = useCancelEventNotification();

  const handleSave = async () => {
    try {
      // Schedule notifications for selected recipients
      const recipientIds = notificationSettings.recipientType === 'all' 
        ? members.map(m => m.userId) // Use userId for the actual user IDs
        : notificationSettings.selectedMembers;

      if (notificationSettings.recipientType === 'select' && recipientIds.length === 0) {
        toast.error('Please select at least one member to notify');
        return;
      }

      const result = await createEventNotification({
        eventId: event.id,
        recipientUserIds: recipientIds,
        daysBefore: parseInt(notificationSettings.daysBefore),
        time: notificationSettings.time,
        projectId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to schedule notifications');
      }

      toast.success(result.message);
      onOpenChange(false);
    } catch {
      toast.error('Failed to set up notification');
    }
  };

  const handleCancelAllNotifications = async () => {
    if (!activeNotifications?.length) return;

    try {
      // Cancel all active notifications
      for (const notification of activeNotifications) {
        await cancelMutation.mutateAsync({
          notificationId: notification.id,
          projectId
        });
      }

      toast.success(`${activeNotifications.length} email reminder(s) cancelled successfully`);
      setShowCancelConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel notifications');
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(userId)
        ? prev.selectedMembers.filter(id => id !== userId)
        : [...prev.selectedMembers, userId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
            Event Reminder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-sm">{event.title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Event Date: {new Date(event.datetime).toLocaleDateString()}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : hasActiveNotification ? (
            // Show cancellation UI if notifications exist
            <>
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Bell className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-green-800 dark:text-green-200 font-medium mb-1">
                    Email reminders are active
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {notificationCount} reminder(s) scheduled for {activeNotifications?.[0]?.daysBefore} day(s) before the event
                  </p>
                </div>
              </div>
              
              {!showCancelConfirm ? (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant="destructive"
                    className="flex-1"
                  >
                    Cancel Reminders
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-red-800 dark:text-red-200 font-medium mb-1">
                        Are you sure?
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        All {notificationCount} email reminder(s) will be permanently cancelled. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1"
                    >
                      Keep Reminders
                    </Button>
                    <Button
                      onClick={handleCancelAllNotifications}
                      disabled={cancelMutation.isPending}
                      variant="destructive"
                      className="flex-1 disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel All'}
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            // Show creation UI if no notifications exist
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                      Days Before
                    </Label>
                    <Select
                      value={notificationSettings.daysBefore}
                      onValueChange={(value) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        daysBefore: value 
                      }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Same day</SelectItem>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                      Time (Bangkok)
                    </Label>
                    <TimePicker
                      value={notificationSettings.time}
                      onChange={(time) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        time 
                      }))}
                    />
                  </div>
                </div>

                {/* Recipients */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                    Recipients
                  </Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="recipientType"
                        checked={notificationSettings.recipientType === 'all'}
                        onChange={() => setNotificationSettings(prev => ({ 
                          ...prev, 
                          recipientType: 'all',
                          selectedMembers: []
                        }))}
                        className="rounded border-gray-300"
                      />
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-green-600" />
                        All project members ({members.length})
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="recipientType"
                        checked={notificationSettings.recipientType === 'select'}
                        onChange={() => setNotificationSettings(prev => ({ 
                          ...prev, 
                          recipientType: 'select'
                        }))}
                        className="rounded border-gray-300"
                      />
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        Select specific members
                      </div>
                    </label>
                  </div>

                  {notificationSettings.recipientType === 'select' && (
                    <div className="space-y-1 mt-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      {members.map(member => (
                        <label
                          key={member.userId}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.selectedMembers.includes(member.userId)}
                            onChange={() => toggleMemberSelection(member.userId)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage 
                                src={member.userImage || undefined} 
                                alt={member.userName}
                              />
                              <AvatarFallback className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {member.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-xs font-medium">{member.userName}</div>
                              <div className="text-xs text-gray-500">{member.userEmail}</div>
                            </div>
                            {member.role === 'leader' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Leader</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-800 dark:text-green-200">
                    Email will be sent to {
                      notificationSettings.recipientType === 'all' 
                        ? `all ${members.length} project members` 
                        : notificationSettings.selectedMembers.length === 0
                          ? 'selected members'
                          : `${notificationSettings.selectedMembers.length} selected member(s)`
                    } {notificationSettings.daysBefore === '0' ? 'on the same day' : `${notificationSettings.daysBefore} day(s) before`} the event at {notificationSettings.time} Bangkok time.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Reminder
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 