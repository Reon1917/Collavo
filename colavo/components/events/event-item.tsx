"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, MapPin, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDate, formatRelativeTime } from '@/utils/date';
import type { Event } from '@/types';

interface EventItemProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onUpdate?: (event: Event) => void;
}

export function EventItem({ event, onEdit, onDelete }: EventItemProps) {
  const handleEdit = () => {
    onEdit?.(event);
  };

  const handleDelete = () => {
    // TODO: Replace with proper confirmation dialog  
    // Using window.confirm for now until proper modal is implemented in parent component
    if (window.confirm(`Are you sure you want to delete the event "${event.title}"? This action cannot be undone.`)) {
      onDelete?.(event.id);
    }
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'deadline':
        return 'bg-red-100 text-red-800';
      case 'milestone':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const isUpcoming = event.startDate.getTime() > Date.now();
  const isPast = event.endDate.getTime() < Date.now();

  return (
    <Card className={`transition-all hover:shadow-md ${isPast ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getEventTypeColor(event.type)}>
                {event.type}
              </Badge>
              {isUpcoming && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Upcoming
                </Badge>
              )}
              {isPast && (
                <Badge variant="outline" className="text-muted-foreground border-gray-400">
                  Past
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {event.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {event.isAllDay 
                ? formatDate(event.startDate)
                : `${formatDate(event.startDate)} ${event.startDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}`
              }
            </span>
          </div>

          {!event.isAllDay && event.endDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Duration: {Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))} minutes
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
            <span>Created {formatRelativeTime(event.createdAt)}</span>
          </div>
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Calendar view version with minimal info - removing as it's mock implementation
