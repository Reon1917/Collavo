"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationSettings } from '../NotificationSettings';

interface PostNotificationSettingsProps {
  entityType: 'task' | 'event';
  entityId: string;
  entityTitle: string;
  projectId: string;
  hasDeadline?: boolean;
  hasAssignee?: boolean;
  deadline?: string;
  assignedUserId?: string;
  eventDateTime?: string;
  members?: Array<{ userId: string; userName: string; userEmail: string }>;
  existingNotifications?: Array<{ id: string; status: string }>;
  onNotificationScheduled?: (notificationId: string) => void;
}

export function PostNotificationSettings({
  entityType,
  entityId,
  entityTitle,
  projectId,
  hasDeadline = false,
  hasAssignee = false,
  deadline,
  assignedUserId,
  eventDateTime,
  members = [],
  existingNotifications = [],
  onNotificationScheduled
}: PostNotificationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    daysBefore: 1,
    recipientUserIds: entityType === 'task' && assignedUserId ? [assignedUserId] : []
  });

  // Check if there are active notifications
  const hasActiveNotifications = existingNotifications.some(n => 
    n.status === 'pending' || n.status === 'scheduled'
  );

  // Validation for tasks
  const canSetupTaskNotification = entityType === 'task' && hasDeadline && hasAssignee;
  
  // Validation for events
  const canSetupEventNotification = entityType === 'event' && eventDateTime && members.length > 0;

  const canSetupNotification = canSetupTaskNotification || canSetupEventNotification;

  const handleSetupNotification = async () => {
    if (!notificationSettings.enabled) {
      toast.error('Please enable notifications first');
      return;
    }

    if (entityType === 'event' && notificationSettings.recipientUserIds.length === 0) {
      toast.error('Please select at least one recipient for event notifications');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = entityType === 'task' 
        ? `/api/projects/${projectId}/tasks/${entityId}/notifications`
        : `/api/projects/${projectId}/events/${entityId}/notifications`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationSettings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to setup ${entityType} notification`);
      }

      const result = await response.json();
      
      toast.success(`${entityType === 'task' ? 'Task' : 'Event'} notification scheduled successfully!`);
      
      onNotificationScheduled?.(result.notificationId);
      setIsOpen(false);
      
      // Reset form
      setNotificationSettings({
        enabled: false,
        daysBefore: 1,
        recipientUserIds: entityType === 'task' && assignedUserId ? [assignedUserId] : []
      });

    } catch (error) {
      console.error(`Error setting up ${entityType} notification:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to setup ${entityType} notification`);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (hasActiveNotifications) {
      return (
        <>
          <Bell className="h-3 w-3" />
          <span className="text-xs">Notifications Active</span>
        </>
      );
    }
    return (
      <>
        <BellOff className="h-3 w-3" />
        <span className="text-xs">Add Notification</span>
      </>
    );
  };

  const getRequirements = () => {
    if (entityType === 'task') {
      return {
        missing: (!hasDeadline ? ['deadline'] : []).concat(!hasAssignee ? ['assignee'] : []),
        description: 'Task notifications require a deadline and an assigned member.'
      };
    } else {
      return {
        missing: (!eventDateTime ? ['event date'] : []).concat(members.length === 0 ? ['project members'] : []),
        description: 'Event notifications require an event date and at least one project member to notify.'
      };
    }
  };

  const requirements = getRequirements();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs h-7 px-2 gap-1 ${
            hasActiveNotifications 
              ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {getButtonContent()}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#008080]" />
            Setup {entityType === 'task' ? 'Task' : 'Event'} Notification
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Schedule email notifications for "{entityTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!canSetupNotification && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <X className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Requirements Missing
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {requirements.description}
                  </p>
                  {requirements.missing.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {requirements.missing.map(item => (
                        <Badge key={item} variant="outline" className="text-xs border-yellow-400 text-yellow-700 dark:text-yellow-300">
                          Missing: {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {hasActiveNotifications && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Notifications Already Active
                </p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                This {entityType} already has scheduled notifications. You can manage them in the Notifications section.
              </p>
            </div>
          )}

          {canSetupNotification && !hasActiveNotifications && (
            <NotificationSettings
              type={entityType === 'task' ? 'subtask' : 'event'}
              settings={notificationSettings}
              onSettingsChange={setNotificationSettings}
              hasDeadline={hasDeadline}
              hasAssignee={hasAssignee}
              members={members}
            />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            {canSetupNotification && !hasActiveNotifications && (
              <Button
                onClick={handleSetupNotification}
                disabled={isLoading || !notificationSettings.enabled}
                className="bg-[#008080] hover:bg-[#006666] text-white"
              >
                {isLoading ? 'Setting up...' : 'Setup Notification'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 