import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  MapPin, 
  User, 
  MoreVertical,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow, isAfter, isBefore, isToday } from 'date-fns';
import { toast } from 'sonner';
import { EditEventDialog } from './dialogs/EditEventDialog';
import { EventDetailsDialog } from './dialogs/EventDetailsDialog';
import { Event, Project, getEventStatusColor, formatEventDateTime } from '../types';

interface EventCardProps {
  event: Event;
  project: Project;
  canHandleEvents: boolean;
  onEventUpdated: (updatedEvent: Event) => void;
  onEventDeleted: (eventId: string) => void;
}

export function EventCard({ 
  event, 
  project, 
  canHandleEvents,
  onEventUpdated,
  onEventDeleted
}: EventCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  
  const eventDate = new Date(event.datetime);
  const now = new Date();
  const isUpcoming = isAfter(eventDate, now);
  const isPast = isBefore(eventDate, now);
  const isEventToday = isToday(eventDate);
  
  const { date, time } = formatEventDateTime(event.datetime);

  const handleEditEvent = () => {
    setShowEditDialog(true);
  };

  const handleViewDetails = () => {
    setShowDetailsDialog(true);
  };

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/events/${event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        onEventDeleted(event.id);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete event');
      }
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleEventUpdatedCallback = (updatedEvent: Event) => {
    onEventUpdated(updatedEvent);
  };

  // Permission checks
  const canModifyEvent = project.isLeader || canHandleEvents || event.createdBy === project.currentUserId;

  const getEventStatusInfo = () => {
    if (isEventToday) {
      return { text: 'Today', color: 'text-blue-600 dark:text-blue-400' };
    } else if (isUpcoming) {
      return { text: 'Upcoming', color: 'text-green-600 dark:text-green-400' };
    } else {
      return { text: 'Past', color: 'text-gray-500 dark:text-gray-400' };
    }
  };

  const statusInfo = getEventStatusInfo();

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium border ${getEventStatusColor(event.datetime)}`}
                >
                  {statusInfo.text}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                {event.title}
              </CardTitle>
              {event.description && (
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {event.description}
                </CardDescription>
              )}
            </div>
            {canModifyEvent && (
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="h-7 w-7 p-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center flex-shrink-0 ml-2"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditEvent}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeleteEvent}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* Event DateTime */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{date}</span>
            <Clock className="h-4 w-4 flex-shrink-0 ml-2" />
            <span>{time}</span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Creator */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-4">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Created by {event.creatorName}</span>
          </div>

          {/* Time indicator */}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {isPast ? `${formatDistanceToNow(eventDate)} ago` : 
                 isEventToday ? 'Today' : 
                 `In ${formatDistanceToNow(eventDate)}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="text-xs"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showEditDialog && (
        <EditEventDialog
          event={event}
          projectId={project.id}
          onEventUpdated={handleEventUpdatedCallback}
          onClose={() => setShowEditDialog(false)}
        />
      )}

      {showDetailsDialog && (
        <EventDetailsDialog
          event={event}
          project={project}
          canHandleEvents={canHandleEvents}
          onEventUpdated={handleEventUpdatedCallback}
          onEventDeleted={onEventDeleted}
          onClose={() => setShowDetailsDialog(false)}
        />
      )}
    </>
  );
} 