'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertCircle, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { SubTask } from '../../types';
import { TimePicker } from '@/components/ui/time-picker';
import { useHasActiveNotification, useCancelNotification, useCreateNotification } from '@/hooks/useSubtaskNotifications';
import { DateTime } from 'luxon';

interface SubTaskNotificationModalProps {
  subTask: SubTask;
  projectId: string;
  taskId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubTaskNotificationModal({ subTask, projectId, taskId, isOpen, onOpenChange }: SubTaskNotificationModalProps) {
  const [notificationSettings, setNotificationSettings] = useState({
    daysBefore: '3',
    time: '09:00'
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Helper to format scheduled time in Bangkok timezone
  const formatBangkokDateTime = (date: Date): string => {
    return DateTime.fromJSDate(date)
      .setZone('Asia/Bangkok')
      .toFormat('MMMM dd, yyyy \'at\' hh:mm a');
  };

  // Helper to calculate what the scheduled time will be based on settings
  const calculateScheduledDateTime = (daysBefore: string, time: string): Date | null => {
    if (!subTask.deadline) return null;

    const timeParts = time.split(':');
    if (timeParts.length !== 2) return null;

    const hours = parseInt(timeParts[0]!, 10);
    const minutes = parseInt(timeParts[1]!, 10);

    // Convert deadline to Bangkok timezone
    const deadlineInBangkok = DateTime.fromJSDate(new Date(subTask.deadline)).setZone('Asia/Bangkok');

    // Calculate target date/time
    const targetDate = deadlineInBangkok.startOf('day').minus({ days: parseInt(daysBefore) });
    const targetDateTime = targetDate.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

    return targetDateTime.toJSDate();
  };

  // Use React Query for notifications data
  const {
    hasActiveNotification,
    activeNotification,
    latestNotification,
    isLoading
  } = useHasActiveNotification(projectId, taskId, subTask.id, isOpen);

  const cancelMutation = useCancelNotification();
  const createMutation = useCreateNotification();

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync({
        subtaskId: subTask.id,
        daysBefore: parseInt(notificationSettings.daysBefore),
        time: notificationSettings.time,
        projectId,
      });

      toast.success('Email reminder scheduled successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to set up notification');
    }
  };

  const handleCancelNotification = async () => {
    if (!activeNotification) return;

    try {
      await cancelMutation.mutateAsync({
        notificationId: activeNotification.id,
        projectId
      });

      toast.success('Email reminder cancelled successfully');
      setShowCancelConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel notification');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 dark:bg-background/95 backdrop-blur-sm border border-border dark:border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
            <Bell className="h-5 w-5 text-primary dark:text-primary" />
            Email Reminder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted dark:bg-muted rounded-lg">
            <h4 className="font-medium text-sm text-foreground">{subTask.title}</h4>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
              Assigned to: {subTask.assignedUserName}
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Deadline: {subTask.deadline ? new Date(subTask.deadline).toLocaleDateString() : 'No deadline set'}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : hasActiveNotification ? (
            // Show pending notification UI
            <>
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                    Email reminder scheduled
                  </p>
                  {activeNotification?.scheduledFor && (
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                      Will be sent on <span className="font-semibold">{formatBangkokDateTime(new Date(activeNotification.scheduledFor))}</span>
                    </p>
                  )}
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    ({activeNotification?.daysBefore} day(s) before deadline, Bangkok time)
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
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Cancel Reminder
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 dark:bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-destructive dark:text-destructive font-medium mb-1">
                        Are you sure?
                      </p>
                      <p className="text-xs text-destructive/80 dark:text-destructive/80">
                        Your email reminder will be permanently cancelled. This action cannot be undone.
                        Email notifications are a premium feature.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1"
                    >
                      Keep Reminder
                    </Button>
                    <Button
                      onClick={handleCancelNotification}
                      disabled={cancelMutation.isPending}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : latestNotification && latestNotification.effectiveStatus === 'sent' ? (
            // Show sent notification UI
            <>
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
                    Email reminder sent
                  </p>
                  <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                    Sent on <span className="font-semibold">{formatBangkokDateTime(new Date(latestNotification.scheduledFor))}</span>
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                    ({latestNotification.daysBefore} day(s) before deadline, Bangkok time)
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-0.5">
                    Recipient: {subTask.assignedUserName}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </>
          ) : latestNotification && latestNotification.effectiveStatus === 'cancelled' ? (
            // Show cancelled notification UI
            <>
              <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                <X className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Email reminder cancelled
                  </p>
                  <p className="text-xs text-gray-600/80 dark:text-gray-400/80 mt-1">
                    The scheduled reminder was cancelled
                  </p>
                  {latestNotification.scheduledFor && (
                    <p className="text-xs text-gray-600/70 dark:text-gray-400/70 mt-1">
                      Was scheduled for: <span className="font-medium">{formatBangkokDateTime(new Date(latestNotification.scheduledFor))}</span> (Bangkok time)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            // Show creation UI if no notifications exist
            <>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground dark:text-muted-foreground">
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
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground dark:text-muted-foreground">
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
                
                <div className="flex items-start gap-2 p-3 bg-primary/5 dark:bg-primary/5 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-primary/90 dark:text-primary/90">
                      Email will be sent to <span className="font-medium">{subTask.assignedUserName}</span>
                    </p>
                    {(() => {
                      const scheduledTime = calculateScheduledDateTime(notificationSettings.daysBefore, notificationSettings.time);
                      return scheduledTime ? (
                        <p className="text-xs text-primary/90 dark:text-primary/90 mt-1 font-medium">
                          on {formatBangkokDateTime(scheduledTime)} (Bangkok time)
                        </p>
                      ) : null;
                    })()}
                  </div>
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
                  disabled={createMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Scheduling...' : 'Schedule Reminder'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 