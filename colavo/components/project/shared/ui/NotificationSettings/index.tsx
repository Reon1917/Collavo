"use client";

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Users, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface NotificationSettings {
  daysBefore: number;
  notificationTime: string; // "09:00" format
  recipientUserIds?: string[]; // For events
}

interface NotificationSettingsProps {
  type: 'subtask' | 'event';
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  hasDeadline?: boolean;
  hasAssignee?: boolean; // For subtasks
  members?: Array<{ userId: string; userName: string; userEmail: string }>; // For events
  disabled?: boolean;
  className?: string;
  // New props for save workflow
  onSave?: (settings: NotificationSettings) => Promise<void>;
  existingNotifications?: Array<{ id: string; status: string; daysBefore: number; scheduledFor: string }>;
  // New props for test functionality
  entityId?: string;
  projectId?: string;
}

const TIME_OPTIONS = [
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
];

export function NotificationSettings({
  type,
  settings,
  onSettingsChange,
  hasDeadline = true,
  hasAssignee = true,
  members = [],
  disabled = false,
  className,
  onSave,
  existingNotifications = [],
  entityId,
  projectId
}: NotificationSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedState, setSavedState] = useState<'none' | 'saving' | 'success' | 'error'>('none');

  const canSetupNotifications = type === 'subtask' ? (hasDeadline && hasAssignee) : hasDeadline;
  const hasActiveNotifications = existingNotifications.some(n => n.status === 'pending');

  const handleDaysChange = (value: string) => {
    const days = parseInt(value);
    if (days >= 1 && days <= 30) {
      onSettingsChange({
        ...settings,
        daysBefore: days
      });
      setSavedState('none'); // Reset saved state when user makes changes
    }
  };

  const handleTimeChange = (time: string) => {
    onSettingsChange({
      ...settings,
      notificationTime: time
    });
    setSavedState('none');
  };

  const handleRecipientsChange = (userIds: string[]) => {
    onSettingsChange({
      ...settings,
      recipientUserIds: userIds
    });
    setSavedState('none');
  };

  const toggleRecipient = (userId: string) => {
    const currentRecipients = settings.recipientUserIds || [];
    const newRecipients = currentRecipients.includes(userId)
      ? currentRecipients.filter(id => id !== userId)
      : [...currentRecipients, userId];
    
    handleRecipientsChange(newRecipients);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    // Validation
    if (settings.daysBefore < 1 || settings.daysBefore > 30) {
      toast.error('Days before must be between 1 and 30');
      return;
    }

    if (type === 'event' && (!settings.recipientUserIds || settings.recipientUserIds.length === 0)) {
      toast.error('Please select at least one recipient for event notifications');
      return;
    }

    setIsSaving(true);
    setSavedState('saving');

    try {
      await onSave(settings);
      setSavedState('success');
      toast.success(`${type === 'subtask' ? 'Subtask' : 'Event'} notification scheduled successfully!`);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSavedState('none');
      }, 3000);
    } catch (error) {
      setSavedState('error');
      toast.error(error instanceof Error ? error.message : 'Failed to save notification');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!entityId || !projectId) {
      toast.info('Test notification feature ready! This needs to be called with a specific subtask or event ID.');
      return;
    }

    if (type === 'event' && (!settings.recipientUserIds || settings.recipientUserIds.length === 0)) {
      toast.error('Please select at least one recipient for event test notifications');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          entityId,
          delayMinutes: 2,
          ...(type === 'event' && { recipientUserIds: settings.recipientUserIds })
        }),
      });

      if (response.ok) {
        toast.success('Test notification scheduled! Check your email in 2 minutes.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to schedule test notification');
      }
    } catch (error) {
      toast.error('Failed to schedule test notification');
    } finally {
      setIsSaving(false);
    }
  };

  const getRequirements = () => {
    if (type === 'subtask') {
      return {
        missing: (!hasDeadline ? ['deadline'] : []).concat(!hasAssignee ? ['assignee'] : []),
        description: 'Subtask notifications require a deadline and an assigned member.'
      };
    } else {
      return {
        missing: (!hasDeadline ? ['event date'] : []).concat(members.length === 0 ? ['project members'] : []),
        description: 'Event notifications require an event date and at least one project member to notify.'
      };
    }
  };

  const requirements = getRequirements();

  return (
    <div className={cn("space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50", className)}>
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-[#008080]" />
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-white">
            Email Notifications
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {type === 'subtask' 
              ? 'Remind assignee before deadline'
              : 'Remind selected members before event'
            }
          </p>
        </div>
      </div>

      {!canSetupNotifications && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            {requirements.description}
            {requirements.missing.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {requirements.missing.map(item => (
                  <Badge key={item} variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-300">
                    Missing: {item}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {hasActiveNotifications && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Active Notifications
            </p>
          </div>
          <div className="mt-1 space-y-1">
            {existingNotifications.filter(n => n.status === 'pending').map(notification => (
              <div key={notification.id} className="text-xs text-green-700 dark:text-green-300">
                • {notification.daysBefore} day(s) before → {new Date(notification.scheduledFor).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {canSetupNotifications && (
        <div className="space-y-4">
          {/* Days Before Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Send reminder
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="30"
                value={settings.daysBefore}
                onChange={(e) => handleDaysChange(e.target.value)}
                className="w-20 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                disabled={disabled}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {settings.daysBefore === 1 ? 'day' : 'days'} before {type === 'subtask' ? 'deadline' : 'event'}
              </span>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notification time (Thailand timezone)
            </Label>
            <Select
              value={settings.notificationTime}
              onValueChange={disabled ? () => {} : handleTimeChange}
            >
              <SelectTrigger 
                className={cn(
                  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients Selection for Events */}
          {type === 'event' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Notify members ({settings.recipientUserIds?.length || 0} selected)
              </Label>
              
              {members.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No project members available
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                        settings.recipientUserIds?.includes(member.userId)
                          ? "bg-[#008080]/10 border border-[#008080]/20"
                          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => !disabled && toggleRecipient(member.userId)}
                    >
                      <div className={cn(
                        "w-4 h-4 border-2 rounded flex items-center justify-center",
                        settings.recipientUserIds?.includes(member.userId)
                          ? "bg-[#008080] border-[#008080]"
                          : "border-gray-300 dark:border-gray-600"
                      )}>
                        {settings.recipientUserIds?.includes(member.userId) && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.userName}
                          </span>
                          {settings.recipientUserIds?.includes(member.userId) && (
                            <Badge variant="secondary" className="text-xs bg-[#008080]/10 text-[#008080] border-[#008080]/20">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {member.userEmail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {settings.recipientUserIds && settings.recipientUserIds.length === 0 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    Please select at least one member to receive notifications.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleSave}
              disabled={isSaving || disabled}
              className={cn(
                "flex-1 transition-all duration-200",
                savedState === 'success' ? "bg-green-600 hover:bg-green-700" : "bg-[#008080] hover:bg-[#006666]",
                "text-white"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : savedState === 'success' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : savedState === 'error' ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Error
                </>
              ) : (
                'Save Notification'
              )}
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={handleTestNotification}
                disabled={isSaving || disabled}
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                Test Now
              </Button>
            )}
          </div>

          {/* Info Section */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <Bell className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">How notifications work:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Emails are sent automatically at the scheduled time</li>
                <li>• {type === 'subtask' ? 'Only sent if the task is still incomplete' : 'Sent to all selected members'}</li>
                <li>• You can cancel notifications anytime before they're sent</li>
                <li>• All times are in Thailand timezone (UTC+7)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 