"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus } from 'lucide-react';
import { EventForm } from './EventForm';
import { Event } from '../../types';

interface CreateEventFormProps {
  projectId: string;
  onEventCreated?: (newEvent: Event) => void;
  trigger?: React.ReactNode;
  projectData?: {
    deadline: string | null;
  };
}

interface EventFormData {
  title: string;
  description: string;
  datetime: Date | undefined;
  location: string;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  datetime: undefined,
  location: ''
};

export function CreateEventForm({ projectId, onEventCreated, trigger, projectData }: CreateEventFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState<EventFormData>(initialFormData);

  // Reset form data whenever modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setEventData(initialFormData);
    }
  }, [isOpen]);

  const handleEventSuccess = (event: Event) => {
    // Reset form and close modal
    setEventData(initialFormData);
    setIsOpen(false);
    
    // Trigger optimistic update
    onEventCreated?.(event);
  };

  const handleCancel = () => {
    // Reset form and close modal
    setEventData(initialFormData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        <DialogTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Create New Event
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new event for your project. Schedule meetings, deadlines, or other important dates.
          </DialogDescription>
        </DialogHeader>

        <EventForm
          projectId={projectId}
          eventData={eventData}
          setEventData={setEventData}
          projectData={projectData || { deadline: null }}
          onSuccess={handleEventSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
} 