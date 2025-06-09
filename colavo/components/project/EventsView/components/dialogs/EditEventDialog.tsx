import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event } from '../../types';

interface EditEventDialogProps {
  event: Event;
  projectId: string;
  onEventUpdated: (event: Event) => void;
  onClose: () => void;
}

export function EditEventDialog({ event, projectId, onEventUpdated, onClose }: EditEventDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Edit event functionality will be implemented here.</p>
          <p>Event: {event.title}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 