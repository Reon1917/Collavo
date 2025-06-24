"use client";

import { Badge } from '@/components/ui/badge';
import { BellOff, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationStatusIndicatorProps {
  status?: 'pending' | 'sent' | 'failed' | 'cancelled' | null;
  daysBefore?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Notification Scheduled', 
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
    icon: Clock
  },
  sent: { 
    label: 'Notification Sent', 
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle
  },
  failed: { 
    label: 'Notification Failed', 
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle
  },
  cancelled: { 
    label: 'Notification Cancelled', 
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400',
    icon: AlertCircle
  }
};

export function NotificationStatusIndicator({ 
  status, 
  daysBefore, 
  className, 
  size = 'sm' 
}: NotificationStatusIndicatorProps) {
  if (!status) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-gray-500 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
          size === 'sm' && "text-xs px-2 py-0.5",
          size === 'md' && "text-sm px-2 py-1",
          size === 'lg' && "text-base px-3 py-1.5",
          className
        )}
      >
        <BellOff className={cn(
          "mr-1",
          size === 'sm' && "h-3 w-3",
          size === 'md' && "h-4 w-4",
          size === 'lg' && "h-5 w-5"
        )} />
        No Notification
      </Badge>
    );
  }

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "border",
        config.color,
        size === 'sm' && "text-xs px-2 py-0.5",
        size === 'md' && "text-sm px-2 py-1", 
        size === 'lg' && "text-base px-3 py-1.5",
        className
      )}
    >
      <Icon className={cn(
        "mr-1",
        size === 'sm' && "h-3 w-3",
        size === 'md' && "h-4 w-4",
        size === 'lg' && "h-5 w-5"
      )} />
      {status === 'pending' && daysBefore ? `${daysBefore}d reminder` : config.label}
    </Badge>
  );
} 