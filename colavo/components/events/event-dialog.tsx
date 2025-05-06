"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, BellRing, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { addLocalEvent } from '@/lib/client-data';

interface EventDialogProps {
  projectId: string;
  onEventAdded: (event?: any) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  initialData?: any;
  isEditMode?: boolean;
}

export function EventDialog({ projectId, onEventAdded, open: controlledOpen, setOpen: setControlledOpen, initialData, isEditMode }: EventDialogProps) {
  const [open, setOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : open;
  const setDialogOpen = isControlled ? setControlledOpen! : setOpen;
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : new Date());
  const [time, setTime] = useState(initialData?.time || '12:00');
  const [dateOpen, setDateOpen] = useState(false);
  const [location, setLocation] = useState(initialData?.location || '');

  // Update form fields when switching to edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDate(initialData.date ? new Date(initialData.date) : new Date());
      setTime(initialData.time || '12:00');
      setLocation(initialData.location || '');
    }
  }, [isEditMode, initialData]);

  const handleSubmit = () => {
    if (!title || !date) return;
    if (isEditMode && initialData) {
      const updatedEvent = {
        ...initialData,
        title,
        description,
        date: date.toISOString(),
        time,
        location,
      };
      onEventAdded(updatedEvent);
      setDialogOpen(false);
      return;
    }
    // Create a new event
    const newEvent = {
      id: uuidv4(),
      title,
      description,
      projectId,
      createdAt: new Date().toISOString(),
      date: date.toISOString(),
      time,
      location,
      type: 'event' as const,
    };
    // Add the event to local storage
    addLocalEvent(newEvent);
    // Reset form and close dialog
    setTitle('');
    setDescription('');
    setDate(new Date());
    setTime('12:00');
    setLocation('');
    setDialogOpen(false);
    // Notify parent component
    onEventAdded();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>Add Event</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Edit the event details.' : 'Create a new event for your project. Events will appear on the calendar.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Team Meeting"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Discuss project progress..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3">
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      setDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <div className="col-span-3 flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              placeholder="Conference Room A"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>{isEditMode ? 'Save Changes' : 'Create Event'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
