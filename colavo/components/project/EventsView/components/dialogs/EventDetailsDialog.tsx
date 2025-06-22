import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
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
  const createdDate = new Date(event.createdAt);
  
  // Calculate time difference for "X days ago" display
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - eventDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const getEventStatus = () => {
    if (eventDate < now) {
      return { label: 'Past', color: 'bg-gray-500 dark:bg-gray-600' };
    } else if (diffDays <= 1) {
      return { label: 'Today', color: 'bg-[#008080] dark:bg-[#00FFFF]' };
    } else if (diffDays <= 7) {
      return { label: 'Upcoming', color: 'bg-green-500 dark:bg-green-600' };
    } else {
      return { label: 'Upcoming', color: 'bg-[#008080] dark:bg-[#008080]' };
    }
  };

  const status = getEventStatus();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#008080] dark:text-[#00FFFF]" />
              Event Details
            </DialogTitle>
            <Badge className={`${status.color} text-white`}>
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Event Title and Description */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
            {event.description && (
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Date & Time Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[#008080] dark:text-[#00FFFF] font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date & Time
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#008080] dark:text-[#00FFFF]" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Date</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {format(eventDate, 'EEEE, MMMM do, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#008080] dark:text-[#00FFFF]" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Time</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {format(eventDate, 'h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 px-3 py-2 bg-[#008080]/10 dark:bg-[#008080]/20 rounded-md">
                <p className="text-[#008080] dark:text-[#00FFFF] text-sm">
                  {diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`}
                </p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          {event.location && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#008080] dark:text-[#00FFFF]" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">{event.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Created By Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[#008080] dark:text-[#00FFFF]" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Created by</p>
                <p className="text-gray-900 dark:text-white font-medium">{event.creatorName}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {format(createdDate, 'MMM do, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            onClick={onClose}
            className="bg-[#008080] hover:bg-[#006666] text-white border-0"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 