import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Event } from '../../types';

interface EventFormData {
  title: string;
  description: string;
  datetime: Date | undefined;
  location: string;
}

interface EventFormProps {
  projectId: string;
  eventData: EventFormData;
  setEventData: (data: EventFormData | ((prev: EventFormData) => EventFormData)) => void;
  projectData?: { deadline: string | null };
  onSuccess: (event: Event) => void;
  onCancel: () => void;
}

export function EventForm({ 
  projectId, 
  eventData, 
  setEventData, 
  projectData, 
  onSuccess, 
  onCancel 
}: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('12:00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventData.title.trim()) {
      toast.error('Event title is required');
      return;
    }

    if (!eventData.datetime) {
      toast.error('Event date and time is required');
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const eventDateTime = new Date(eventData.datetime);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title.trim(),
          description: eventData.description.trim() || null,
          datetime: eventDateTime.toISOString(),
          location: eventData.location.trim() || null
        }),
      });

      if (response.ok) {
        const event = await response.json();
        toast.success('Event created successfully!');
        onSuccess(event);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create event');
      }
    } catch {
      toast.error('Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Title *
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter event title..."
          value={eventData.title}
          onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
          maxLength={500}
          required
          disabled={isLoading}
        />
      </div>

      {/* Event Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the event details, agenda, or purpose..."
          value={eventData.description}
          onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] min-h-[80px] resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Event Date */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Date *
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:border-[#008080] dark:hover:border-[#00FFFF]",
                !eventData.datetime && "text-gray-500 dark:text-gray-400"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {eventData.datetime ? format(eventData.datetime, "PPP") : "Select event date *"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <Calendar
              mode="single"
              selected={eventData.datetime}
              onSelect={(date) => setEventData(prev => ({ ...prev, datetime: date }))}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Event Time */}
      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Time *
        </Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Enter event location (optional)"
          value={eventData.location}
          onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
          className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
          maxLength={500}
          disabled={isLoading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Event'
          )}
        </Button>
      </div>
    </form>
  );
} 