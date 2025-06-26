'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SubTask } from '../../types';
import { createSubtaskNotification } from '@/lib/actions/email-notifications';

interface SubTaskNotificationModalProps {
  subTask: SubTask;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubTaskNotificationModal({ subTask, projectId, isOpen, onOpenChange }: SubTaskNotificationModalProps) {
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    daysBefore: '3',
    time: '09:00'
  });

  const handleSave = async () => {
    if (!notificationSettings.enabled) {
      toast.success('Notification disabled');
      onOpenChange(false);
      return;
    }

    try {
      const result = await createSubtaskNotification({
        subtaskId: subTask.id,
        daysBefore: parseInt(notificationSettings.daysBefore),
        time: notificationSettings.time,
        projectId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to schedule notification');
      }

      toast.success('Email reminder scheduled successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      toast.error('Failed to set up notification');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Email Reminder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-sm">{subTask.title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Assigned to: {subTask.assignedUserName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Deadline: {subTask.deadline ? new Date(subTask.deadline).toLocaleDateString() : 'No deadline set'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enable-notification"
                checked={notificationSettings.enabled}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, 
                  enabled: e.target.checked 
                }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="enable-notification" className="text-sm">
                Send email reminder
              </Label>
            </div>

            {notificationSettings.enabled && (
              <div className="space-y-3 pl-6">
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
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                      Time (Bangkok)
                    </Label>
                    <Input
                      type="time"
                      value={notificationSettings.time}
                      onChange={(e) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        time: e.target.value 
                      }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Email will be sent to {subTask.assignedUserName} {notificationSettings.daysBefore} day(s) before the deadline at {notificationSettings.time} Bangkok time.
                  </p>
                </div>
              </div>
            )}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {notificationSettings.enabled ? 'Save Reminder' : 'Disable'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 