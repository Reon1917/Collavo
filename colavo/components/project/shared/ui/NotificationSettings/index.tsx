"use client";

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationSettings {
  enabled: boolean;
  daysBefore: number;
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
}

const DAY_OPTIONS = [
  { value: 1, label: '1 day before', description: 'Next day reminder' },
  { value: 2, label: '2 days before', description: 'Early notice' },
  { value: 3, label: '3 days before', description: 'Standard reminder' },
  { value: 5, label: '5 days before', description: 'Early warning' },
  { value: 7, label: '1 week before', description: 'Advance notice' },
  { value: 14, label: '2 weeks before', description: 'Long-term planning' },
];

export function NotificationSettings({
  type,
  settings,
  onSettingsChange,
  hasDeadline = true,
  hasAssignee = true,
  members = [],
  disabled = false,
  className
}: NotificationSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(settings.enabled);

  const canEnableNotifications = type === 'subtask' ? (hasDeadline && hasAssignee) : hasDeadline;

  const handleToggle = (enabled: boolean) => {
    if (!enabled) {
      onSettingsChange({
        enabled: false,
        daysBefore: settings.daysBefore,
        recipientUserIds: settings.recipientUserIds
      });
      setIsExpanded(false);
    } else if (canEnableNotifications) {
      onSettingsChange({
        enabled: true,
        daysBefore: settings.daysBefore || 1,
        recipientUserIds: settings.recipientUserIds || []
      });
      setIsExpanded(true);
    }
  };

  const handleDaysChange = (days: string) => {
    onSettingsChange({
      ...settings,
      daysBefore: parseInt(days)
    });
  };

  const handleRecipientsChange = (userIds: string[]) => {
    onSettingsChange({
      ...settings,
      recipientUserIds: userIds
    });
  };

  const toggleRecipient = (userId: string) => {
    const currentRecipients = settings.recipientUserIds || [];
    const newRecipients = currentRecipients.includes(userId)
      ? currentRecipients.filter(id => id !== userId)
      : [...currentRecipients, userId];
    
    handleRecipientsChange(newRecipients);
  };

  return (
    <div className={cn("space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-[#008080]" />
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Email Notifications
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {type === 'subtask' 
                ? 'Remind assignee before deadline if task incomplete'
                : 'Remind selected members before event time'
              }
            </p>
          </div>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={handleToggle}
          disabled={disabled || !canEnableNotifications}
          className="data-[state=checked]:bg-[#008080]"
        />
      </div>

      {!canEnableNotifications && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            {type === 'subtask' 
              ? 'Notifications require both a deadline and an assigned member.'
              : 'Notifications require a deadline to be set.'
            }
          </div>
        </div>
      )}

      {isExpanded && settings.enabled && (
        <div className="space-y-4 pl-8 border-l-2 border-[#008080]/20">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Send reminder
            </Label>
            <Select
              value={settings.daysBefore.toString()}
              onValueChange={handleDaysChange}
              disabled={disabled}
            >
              <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                          <div className="w-2 h-2 bg-white rounded-full" />
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