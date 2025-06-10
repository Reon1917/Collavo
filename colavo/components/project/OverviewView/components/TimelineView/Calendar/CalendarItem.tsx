"use client";

import { Clock, Calendar } from 'lucide-react';

export interface CalendarItem {
  id: string;
  title: string;
  type: 'task' | 'event';
  time?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  eventType?: 'meeting' | 'deadline' | 'milestone' | 'reminder' | 'other';
  startDate?: Date;
  dueDate?: Date;
}

interface CalendarItemProps {
  item: CalendarItem;
  onClick?: () => void;
}

export function CalendarItem({ item, onClick }: CalendarItemProps) {
  const getItemColor = () => {
    if (item.type === 'event') {
      switch (item.eventType) {
        case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        case 'deadline': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case 'milestone': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case 'reminder': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
      }
    } else {
      switch (item.priority) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      }
    }
  };

  const getIcon = () => {
    return item.type === 'event' ? <Calendar className="h-3 w-3" /> : <Clock className="h-3 w-3" />;
  };

  return (
    <div
      className={`group/item px-2 py-1 rounded text-xs border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-sm ${getItemColor()}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 mb-1">
        {getIcon()}
        <span className="font-medium truncate">{item.title}</span>
      </div>
      {item.time && (
        <div className="text-xs opacity-75">{item.time}</div>
      )}
    </div>
  );
} 