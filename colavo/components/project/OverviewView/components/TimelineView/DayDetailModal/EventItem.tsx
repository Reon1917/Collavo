"use client";

import { Badge } from '@/components/ui/badge';
import {MapPin, Calendar } from 'lucide-react';

interface EventItemProps {
  event: {
    id: string;
    title: string;
    type: 'meeting' | 'deadline' | 'milestone' | 'reminder' | 'other';
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    location?: string | null;
  };
}

export function EventItem({ event }: EventItemProps) {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'milestone': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="p-3 border border-border dark:border-border rounded-lg bg-background dark:bg-muted/50 hover:shadow-sm transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground dark:text-foreground text-sm">{event.title}</h4>
        <Badge className={getEventTypeColor(event.type)} variant="secondary">
          {event.type}
        </Badge>
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground dark:text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {event.isAllDay 
              ? 'All day'
              : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`
            }
          </span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
} 