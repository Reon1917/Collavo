"use client";

import { Badge } from '@/components/ui/badge';
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
        case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
        case 'milestone': return 'bg-green-100 text-green-800 border-green-200';
        case 'reminder': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      switch (item.priority) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    }
  };

  const getIcon = () => {
    return item.type === 'event' ? <Calendar className="h-3 w-3" /> : <Clock className="h-3 w-3" />;
  };

  return (
    <div
      className={`px-2 py-1 rounded text-xs border cursor-pointer hover:shadow-sm transition-shadow ${getItemColor()}`}
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