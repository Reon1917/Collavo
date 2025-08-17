"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { formatDateForInput } from '@/utils/date';
import type { Event, CreateEventData, EventType } from '@/types';

interface EventDialogProps {
  trigger?: React.ReactNode;
  event?: Event;
  onSave?: (eventData: CreateEventData) => void;
  mode?: 'create' | 'edit';
}

export function EventDialog({ 
  trigger, 
  event, 
  onSave, 
  mode = 'create' 
}: EventDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    title: event?.title || '',
    description: event?.description || '',
    type: (event?.type as EventType) || 'meeting',
    startDate: event?.startDate || new Date(),
    endDate: event?.endDate || new Date(),
    isAllDay: event?.isAllDay || false,
    location: event?.location || '',
    attendees: event?.attendees || [],
    tags: event?.tags || [],
    isRecurring: event?.isRecurring || false,
    recurrenceRule: event?.recurrenceRule || null,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave?.(formData);
    setOpen(false);
  };

  const handleInputChange = (field: keyof CreateEventData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value as EventType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formatDateForInput(formData.startDate)}
                  onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                  required
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formatDateForInput(formData.endDate)}
                  onChange={(e) => handleInputChange('endDate', new Date(e.target.value))}
                  required
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter event location"
              />
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="isAllDay" className="text-sm">
              All day event
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Event' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
