import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <h3 className="font-semibold">{event.title}</h3>
          <p className="text-gray-600 mt-2">{event.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Date: {new Date(event.datetime).toLocaleDateString()}
          </p>
          {event.location && (
            <p className="text-sm text-gray-500">Location: {event.location}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 