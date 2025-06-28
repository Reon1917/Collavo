import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
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
  const [selectedTime, setSelectedTime] = useState({ hour: '12', minute: '00' });

  // Get project deadline for validation
  const projectDeadline = projectData?.deadline ? new Date(projectData.deadline) : null;

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

    // Validate against project deadline
    if (projectDeadline && eventData.datetime > projectDeadline) {
      toast.error('Event date cannot be later than the project deadline');
      return;
    }

    // Combine date and time
    const eventDateTime = new Date(eventData.datetime);
    eventDateTime.setHours(parseInt(selectedTime.hour), parseInt(selectedTime.minute));

    // Additional validation for combined datetime against project deadline
    if (projectDeadline && eventDateTime > projectDeadline) {
      toast.error('Event date and time cannot be later than the project deadline');
      return;
    }

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

  const handleDateSelect = (date: Date | undefined) => {
    setEventData((prev: EventFormData) => ({ ...prev, datetime: date }));
  };

  const generateTimeOptions = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];
    return { hours, minutes };
  };

  const { hours, minutes } = generateTimeOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Deadline Warning */}
      {projectDeadline && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Project Deadline: {format(projectDeadline, "PPP")}</p>
            <p>Events cannot be scheduled after the project deadline.</p>
          </div>
        </div>
      )}

      {/* Event Title */}
      <div className="space-y-3">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Title *
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter event title..."
          value={eventData.title}
          onChange={(e) => setEventData((prev: EventFormData) => ({ ...prev, title: e.target.value }))}
          className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
          maxLength={500}
          required
          disabled={isLoading}
        />
      </div>

      {/* Event Description */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the event details, agenda, or purpose..."
          value={eventData.description}
          onChange={(e) => setEventData((prev: EventFormData) => ({ ...prev, description: e.target.value }))}
          className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] min-h-[80px] resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Event Date */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Date *
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700",
                !eventData.datetime && "text-gray-500 dark:text-gray-400",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {eventData.datetime ? format(eventData.datetime, "PPP") : "Select date *"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={eventData.datetime}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Disable dates before today
                if (date < today) return true;
                
                // Disable dates after project deadline if it exists
                if (projectDeadline) {
                  const deadlineDate = new Date(projectDeadline);
                  deadlineDate.setHours(23, 59, 59, 999); // End of deadline day
                  if (date > deadlineDate) return true;
                }
                
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Event Time */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Time *
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Hour Selector */}
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Hour</Label>
            <Select
              value={selectedTime.hour}
              onValueChange={(hour) => setSelectedTime(prev => ({ ...prev, hour }))}
            >
              <SelectTrigger disabled={isLoading} className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Minute Selector */}
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Minute</Label>
            <Select
              value={selectedTime.minute}
              onValueChange={(minute) => setSelectedTime(prev => ({ ...prev, minute }))}
            >
              <SelectTrigger disabled={isLoading} className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]">
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    :{minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Enter event location (optional)"
          value={eventData.location}
          onChange={(e) => setEventData((prev: EventFormData) => ({ ...prev, location: e.target.value }))}
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
          disabled={isLoading || !eventData.title.trim() || !eventData.datetime}
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