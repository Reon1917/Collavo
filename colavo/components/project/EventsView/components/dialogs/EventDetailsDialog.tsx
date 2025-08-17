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
  
  // Calculate time difference preserving sign for past/future determination
  const now = new Date();
  const diffTime = now.getTime() - eventDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const getEventStatus = () => {
    if (eventDate < now) {
      return { label: 'Past', color: 'bg-muted0 dark:bg-gray-600' };
    } else if (diffDays === 0) {
      return { label: 'Today', color: 'bg-primary dark:bg-secondary' };
    } else if (diffDays >= -7 && diffDays < 0) {
      return { label: 'Upcoming', color: 'bg-green-500 dark:bg-green-600' };
    } else {
      return { label: 'Upcoming', color: 'bg-primary dark:bg-primary' };
    }
  };

  const getTimeDisplayText = () => {
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays > 1) {
      return `${diffDays} days ago`;
    } else if (diffDays === -1) {
      return 'Tomorrow';
    } else if (diffDays < -1) {
      return `In ${Math.abs(diffDays)} days`;
    }
    return 'Today';
  };

  const status = getEventStatus();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background dark:bg-card border-border dark:border-border text-foreground dark:text-foreground">
        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground dark:text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary dark:text-secondary" />
              Event Details
            </DialogTitle>
            <Badge className={`${status.color} text-foreground`}>
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Event Title and Description */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground dark:text-foreground">{event.title}</h2>
            {event.description && (
              <p className="text-muted-foreground text-base leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Date & Time Section */}
          <div className="bg-muted dark:bg-muted/50 rounded-lg p-4 border border-border dark:border-border">
            <h3 className="text-primary dark:text-secondary font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date & Time
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary dark:text-secondary" />
                <div>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">Date</p>
                  <p className="text-foreground dark:text-foreground font-medium">
                    {format(eventDate, 'EEEE, MMMM do, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary dark:text-secondary" />
                <div>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">Time</p>
                  <p className="text-foreground dark:text-foreground font-medium">
                    {format(eventDate, 'h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 px-3 py-2 bg-primary/10 dark:bg-primary/20 rounded-md">
                <p className="text-primary dark:text-secondary text-sm">
                  {getTimeDisplayText()}
                </p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          {event.location && (
            <div className="bg-muted dark:bg-muted/50 rounded-lg p-4 border border-border dark:border-border">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary dark:text-secondary" />
                <div>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">Location</p>
                  <p className="text-foreground dark:text-foreground font-medium">{event.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Created By Section */}
          <div className="bg-muted dark:bg-muted/50 rounded-lg p-4 border border-border dark:border-border">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-primary dark:text-secondary" />
              <div>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">Created by</p>
                <p className="text-foreground dark:text-foreground font-medium">{event.creatorName}</p>
                <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                  {format(createdDate, 'MMM do, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-border dark:border-border">
          <Button 
            onClick={onClose}
            className="bg-primary hover:bg-[#006666] text-foreground border-0"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 