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
  members?: Array<{ userId: string; userName: string; userEmail: string }>;
}

interface EventFormData {
  title: string;
  description: string;
  datetime: Date | undefined;
  location: string;
  notificationSettings: {
    enabled: boolean;
    daysBefore: number;
    recipientUserIds?: string[];
  };
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  datetime: undefined,
  location: '',
  notificationSettings: {
    enabled: false,
    daysBefore: 1,
    recipientUserIds: []
  }
};

export function CreateEventForm({ projectId, onEventCreated, trigger, projectData, members = [] }: CreateEventFormProps) {
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
        <DialogTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white rounded-md font-medium transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#008080]" />
            Create New Event
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
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
          members={members}
        />
      </DialogContent>
    </Dialog>
  );
} 