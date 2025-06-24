"use client";

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  Search,
  RefreshCw,
  Mail,
  User,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from '../ConfirmationDialog';

interface ScheduledNotification {
  id: string;
  type: 'subtask' | 'event';
  entityId: string;
  recipientUserId?: string | null;
  recipientUserIds?: string[] | null;
  scheduledFor: string;
  daysBefore: number;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  qstashMessageId?: string | null;
  emailId?: string | null;
  sentAt?: string | null;
  createdBy: string;
  projectId: string;
  createdAt: string;
  projectName?: string;
  creatorName?: string;
  creatorEmail?: string;
  entityDetails?: {
    type: 'subtask' | 'event';
    title: string;
    deadline?: string;
    datetime?: string;
    status?: string;
    assignedUserName?: string;
    mainTaskTitle?: string;
    location?: string;
  } | null;
}

interface NotificationManagementProps {
  projectId?: string;
  trigger?: React.ReactNode;
  className?: string;
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    icon: Clock
  },
  sent: { 
    label: 'Sent', 
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    icon: CheckCircle
  },
  failed: { 
    label: 'Failed', 
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    icon: XCircle
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
    icon: AlertCircle
  }
};

export function NotificationManagement({ projectId, trigger }: NotificationManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  });
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    notificationId: string;
    notificationTitle: string;
  }>({
    isOpen: false,
    notificationId: '',
    notificationTitle: ''
  });
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      params.append('limit', '50');

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        throw new Error('Failed to fetch notifications');
      }
          } catch {
        // Error fetching notifications
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters.status, filters.type]);

  const handleCancelNotification = async (notificationId: string, notificationTitle: string) => {
    setConfirmationDialog({
      isOpen: true,
      notificationId,
      notificationTitle
    });
  };

  const confirmCancelNotification = async () => {
    const { notificationId } = confirmationDialog;
    setCancellingId(notificationId);

    try {
      const response = await fetch(`/api/notifications/${notificationId}/cancel`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Notification cancelled successfully');
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'cancelled' as const }
              : n
          )
        );
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel notification');
      }
    } catch (error) {
      // Error cancelling notification
      toast.error(error instanceof Error ? error.message : 'Failed to cancel notification');
    } finally {
      setCancellingId(null);
      setConfirmationDialog({
        isOpen: false,
        notificationId: '',
        notificationTitle: ''
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filters.status, filters.type, fetchNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const entityTitle = notification.entityDetails?.title?.toLowerCase() || '';
      const projectName = notification.projectName?.toLowerCase() || '';
      return entityTitle.includes(searchTerm) || projectName.includes(searchTerm);
    }
    return true;
  });

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <Bell className="h-4 w-4" />
      Notifications
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#008080]" />
              Notification Management
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              View and manage scheduled email notifications for tasks and events.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by task/event title or project..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-32 mt-1 bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </Label>
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="w-32 mt-1 bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="subtask">Tasks</SelectItem>
                      <SelectItem value="event">Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchNotifications}
                    disabled={isLoading}
                    className="h-10"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading notifications...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {notifications.length === 0 ? 'No notifications found' : 'No notifications match your filters'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const statusConfig = STATUS_CONFIG[notification.status];
                  const StatusIcon = statusConfig.icon;
                  const isTask = notification.type === 'subtask';

                  return (
                    <div
                      key={notification.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {isTask ? (
                              <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            ) : (
                              <Calendar className="h-5 w-5 text-purple-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {notification.entityDetails?.title || 'Unknown'}
                              </h4>
                              {isTask && notification.entityDetails?.mainTaskTitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  Task: {notification.entityDetails.mainTaskTitle}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Project: {notification.projectName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {notification.daysBefore} day(s) before {isTask ? 'deadline' : 'event'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Scheduled: {format(new Date(notification.scheduledFor), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                            {isTask ? (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{notification.entityDetails?.assignedUserName || 'Unassigned'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{notification.recipientUserIds?.length || 0} recipient(s)</span>
                              </div>
                            )}
                          </div>

                          {notification.sentAt && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                              <Mail className="h-3 w-3" />
                              <span>Sent: {format(new Date(notification.sentAt), 'MMM dd, yyyy HH:mm')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={cn("text-xs border", statusConfig.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>

                          {notification.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelNotification(notification.id, notification.entityDetails?.title || 'notification')}
                              disabled={cancellingId === notification.id}
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog({
          isOpen: false,
          notificationId: '',
          notificationTitle: ''
        })}
        onConfirm={confirmCancelNotification}
        title="Cancel Notification"
        description={`Are you sure you want to cancel the notification for "${confirmationDialog.notificationTitle}"? This action is expensive to perform and cannot be undone.`}
        confirmText="Yes, Cancel Notification"
        cancelText="Keep Notification"
        variant="warning"
        isLoading={cancellingId !== null}
        requireDoubleConfirm={true}
        doubleConfirmText="I understand this is an expensive operation"
      />
    </>
  );
} 