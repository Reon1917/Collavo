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
  Clock,
  ArrowRight,
  Bell
} from 'lucide-react';
import { formatDistanceToNow, isAfter, isBefore, isToday } from 'date-fns';

import { EditEventDialog } from './dialogs/EditEventDialog';
import { EventDetailsDialog } from './dialogs/EventDetailsDialog';
import { EventDeleteModal } from './dialogs/EventDeleteModal';
import { EventNotificationModal } from './dialogs/EventNotificationModal';
import { Event, Project,formatEventDateTime } from '../types';
import { useHasActiveEventNotification } from '@/hooks/useEventNotifications';

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
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const eventDate = new Date(event.datetime);
  const now = new Date();
  const isUpcoming = isAfter(eventDate, now);
  
  // Check for existing event notifications
  const { hasActiveNotification, notificationCount } = useHasActiveEventNotification(
    project.id, 
    event.id, 
    isUpcoming // Only check for upcoming events
  );
  const isPast = isBefore(eventDate, now);
  const isEventToday = isToday(eventDate);
  
  const { date, time } = formatEventDateTime(event.datetime);

  const handleEditEvent = () => {
    setShowEditDialog(true);
  };

  const handleViewDetails = () => {
    setShowDetailsDialog(true);
  };

  const handleDeleteEvent = () => {
    setShowDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = (deletedEventId: string) => {
    onEventDeleted(deletedEventId);
    setShowDeleteConfirmDialog(false);
  };

  const handleEventUpdatedCallback = (updatedEvent: Event) => {
    onEventUpdated(updatedEvent);
  };

  // Permission checks
  const canModifyEvent = project.isLeader || canHandleEvents;

  const getEventStatusInfo = () => {
    if (isEventToday) {
      return { 
        text: 'Today', 
        color: 'text-primary', 
        bgColor: 'bg-primary/10', 
        borderColor: 'border-primary/20' 
      };
    } else if (isUpcoming) {
      return { 
        text: 'Upcoming', 
        color: 'text-green-600 dark:text-green-400', 
        bgColor: 'bg-green-50 dark:bg-green-900/20', 
        borderColor: 'border-green-200 dark:border-green-800' 
      };
    } else {
      return { 
        text: 'Past', 
        color: 'text-gray-500 dark:text-gray-400', 
        bgColor: 'bg-gray-50 dark:bg-gray-900/20', 
        borderColor: 'border-gray-200 dark:border-gray-700' 
      };
    }
  };

  const statusInfo = getEventStatusInfo();

  return (
    <>
      <Card className="group relative bg-card border-border rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 cursor-pointer">
        <CardHeader className="pb-4 flex-shrink-0 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${statusInfo.bgColor} ${statusInfo.color} group-hover:scale-105 transition-transform duration-200`}
                >
                  {statusInfo.text}
                </Badge>
              </div>
              
              {/* Event Title */}
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                {event.title}
              </CardTitle>
              
              {/* Event Description */}
              {event.description && (
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {event.description}
                </CardDescription>
              )}
            </div>
            
            {/* Action Menu */}
            {canModifyEvent && (
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-lg border-border bg-background hover:bg-muted hover:border-muted-foreground flex items-center justify-center flex-shrink-0 ml-3 transition-all duration-200 group-hover:shadow-md">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleEditEvent} className="flex items-center gap-2 py-2">
                    <Edit className="h-4 w-4" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeleteEvent}
                    className="text-red-600 focus:text-red-600 flex items-center gap-2 py-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col relative z-10">
          {/* Event DateTime */}
          <div className="flex items-center gap-3 text-sm text-foreground mb-4 p-3 bg-muted rounded-lg group-hover:bg-background transition-colors duration-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-semibold">{date}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">{time}</span>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 p-2 rounded-lg hover:bg-muted transition-colors duration-200">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium truncate">{event.location}</span>
            </div>
          )}

          {/* Creator */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Created by <span className="font-medium text-foreground">{event.creatorName}</span></span>
          </div>

          {/* Notification Setup - Only for users with event management permissions */}
          {isUpcoming && canModifyEvent && (
            <div className={`flex items-center justify-between p-2 rounded-lg mb-4 border ${
              hasActiveNotification 
                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                <Bell className={`h-4 w-4 ${
                  hasActiveNotification ? 'text-blue-600' : 'text-emerald-600'
                }`} />
                <span className={`text-sm font-medium ${
                  hasActiveNotification 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-emerald-800 dark:text-emerald-200'
                }`}>
                  {hasActiveNotification ? 'Email Reminder Active' : 'Email Reminder'}
                </span>
                {hasActiveNotification && notificationCount > 1 && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotificationModal(true);
                }}
                className={`h-7 px-2 text-xs ${
                  hasActiveNotification 
                    ? 'hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-emerald-100 dark:hover:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {hasActiveNotification ? 'Manage' : 'Setup'}
              </Button>
            </div>
          )}

          {/* Bottom Section */}
          <div className="mt-auto">
            {/* Time indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold ${statusInfo.color}`}>
                {isPast ? `${formatDistanceToNow(eventDate)} ago` : 
                 isEventToday ? 'Today' : 
                 `In ${formatDistanceToNow(eventDate)}`}
              </span>
            </div>
            
            {/* View Details Button - Enhanced on hover */}
            <Button
              variant="outline"
              onClick={handleViewDetails}
              className="w-full justify-between text-sm font-medium border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 group-hover:shadow-md group-hover:scale-[1.02]"
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showEditDialog && (
        <EditEventDialog
          event={event}
          projectId={project.id}
          projectData={project}
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

      {showDeleteConfirmDialog && (
        <EventDeleteModal
          isOpen={showDeleteConfirmDialog}
          onOpenChange={setShowDeleteConfirmDialog}
          event={event}
          projectId={project.id}
          onEventDeleted={handleConfirmDelete}
        />
      )}

      {showNotificationModal && canModifyEvent && (
        <EventNotificationModal
          event={event}
          members={project.members}
          projectId={project.id}
          isOpen={showNotificationModal}
          onOpenChange={setShowNotificationModal}
        />
      )}
    </>
  );
} 