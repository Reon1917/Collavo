import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  User, 
  CalendarDays,
  Clock4
} from 'lucide-react';
import { format, isAfter, isBefore, isToday, formatDistanceToNow } from 'date-fns';
import { Event, Project } from '../../types';

interface EventDetailsDialogProps {
  event: Event;
  project: Project;
  canHandleEvents: boolean;
  onEventUpdated: (event: Event) => void;
  onEventDeleted: (eventId: string) => void;
  onClose: () => void;
}

export function EventDetailsDialog({ 
  event, 
  onClose 
}: EventDetailsDialogProps) {
  const eventDate = new Date(event.datetime);
  const now = new Date();
  const isUpcoming = isAfter(eventDate, now);
  const isPast = isBefore(eventDate, now);
  const isEventToday = isToday(eventDate);

  const getEventStatusInfo = () => {
    if (isEventToday) {
      return { 
        text: 'Today', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400'
      };
    } else if (isUpcoming) {
      return { 
        text: 'Upcoming', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400'
      };
    } else {
      return { 
        text: 'Past', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800',
        icon: 'text-gray-600 dark:text-gray-400'
      };
    }
  };

  const statusInfo = getEventStatusInfo();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-xl">
        {/* Header with accent bar */}
        <div className="relative">
          <div className="h-1 bg-gradient-to-r from-[#008080] to-[#006666] dark:from-[#00FFFF] dark:to-[#00CCCC] rounded-t-lg"></div>
          <DialogHeader className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#008080] dark:text-[#00FFFF]" />
                  Event Details
                </DialogTitle>
                <Badge className={`mt-1 text-xs ${statusInfo.color}`}>
                  {statusInfo.text}
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-4 pb-4">
          {/* Event Title and Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {event.title}
            </h2>
            {event.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Date and Time Information */}
          <Card className="bg-gradient-to-br from-[#008080]/10 to-[#006666]/10 dark:from-[#00FFFF]/10 dark:to-[#00CCCC]/10 border border-[#008080]/20 dark:border-[#00FFFF]/20 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#008080] dark:text-[#00FFFF]" />
                Date & Time
              </h3>
              
              <div className="space-y-3">
                {/* Date */}
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Calendar className="h-4 w-4 text-[#008080] dark:text-[#00FFFF] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(eventDate, 'EEEE, MMMM do, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Clock4 className="h-4 w-4 text-[#008080] dark:text-[#00FFFF] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Time</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(eventDate, 'h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Relative Time */}
                <div className="p-2 bg-[#008080]/10 dark:bg-[#00FFFF]/10 rounded-lg border border-[#008080]/20 dark:border-[#00FFFF]/20">
                  <p className="text-xs text-[#008080] dark:text-[#00FFFF] font-medium">
                    {isPast ? `${formatDistanceToNow(eventDate)} ago` : 
                     isEventToday ? 'Today' : 
                     `In ${formatDistanceToNow(eventDate)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <MapPin className="h-4 w-4 text-[#008080] dark:text-[#00FFFF] flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {event.location}
                </p>
              </div>
            </div>
          )}

          {/* Event Creator Information */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <User className="h-4 w-4 text-[#008080] dark:text-[#00FFFF] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created by</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {event.creatorName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(event.createdAt), 'MMM do, yyyy')}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#008080] dark:border-[#00FFFF] text-[#008080] dark:text-[#00FFFF] hover:bg-[#008080]/10 dark:hover:bg-[#00FFFF]/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 