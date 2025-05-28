"use client";

import { BellRing, Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/types';

interface EventItemProps {
  event: Event;
}

export function EventItem({ event }: EventItemProps) {
  const eventDate = new Date(event.date);
  
  return (
    <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-xs flex flex-col gap-1">
      <div className="flex items-center gap-1 font-medium text-blue-700">
        <BellRing className="h-3 w-3" />
        <span className="truncate">{event.title}</span>
      </div>
      
      {event.location && (
        <div className="flex items-center gap-1 text-blue-600">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 text-blue-600">
        <Calendar className="h-3 w-3" />
        <span>{format(eventDate, 'MMM d')}</span>
      </div>

      <div className="flex items-center gap-1 text-blue-600">
        <Clock className="h-3 w-3" />
        <span>{event.time}</span>
      </div>
    </div>
  );
}

// Helper function to check if two dates are on the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

interface CalendarEventItemProps {
  event: Event;
}

export function CalendarEventItem({ event }: CalendarEventItemProps) {
  return (
    <div className="text-xs p-1 mb-1 bg-blue-100 text-blue-800 rounded truncate">
      <div className="font-medium">{event.title}</div>
      {event.time && (
        <div className="text-blue-600">{event.time}</div>
      )}
    </div>
  );
}
