'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertCircle, Users, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createEventNotification } from '@/lib/actions/email-notifications';

interface EventNotificationModalProps {
  event: {
    id: string;
    title: string;
    datetime: string;
  };
  members: Array<{ id: string; name: string; email?: string }>;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventNotificationModal({ event, members, projectId, isOpen, onOpenChange }: EventNotificationModalProps) {
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    daysBefore: '1',
    time: '09:00',
    recipientType: 'all' as 'all' | 'select',
    selectedMembers: [] as string[]
  });

  const handleSave = async () => {
    if (!notificationSettings.enabled) {
      toast.success('Notification disabled');
      onOpenChange(false);
      return;
    }

    try {
      // Schedule notifications for selected recipients
      const recipientIds = notificationSettings.recipientType === 'all' 
        ? members.map(m => m.id)
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
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      toast.error('Failed to set up notification');
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter(id => id !== memberId)
        : [...prev.selectedMembers, memberId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
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
              <div className="space-y-4 pl-6">
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
                        All project members
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
                    <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                      {members.map(member => (
                        <label
                          key={member.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.selectedMembers.includes(member.id)}
                            onChange={() => toggleMemberSelection(member.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-xs">{member.name}</span>
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
                        ? 'all project members' 
                        : notificationSettings.selectedMembers.length === 0
                          ? 'selected members'
                          : `${notificationSettings.selectedMembers.length} selected member(s)`
                    } {notificationSettings.daysBefore === '0' ? 'on the same day' : `${notificationSettings.daysBefore} day(s) before`} at {notificationSettings.time} Bangkok time.
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {notificationSettings.enabled ? 'Save Reminder' : 'Disable'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 