"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskItem } from './TaskItem';
import { EventItem } from './EventItem';
import { Calendar, Clock } from 'lucide-react';

interface DayDetailModalProps {
  date: Date | null;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    importance: 'low' | 'normal' | 'high' | 'critical';
    dueDate?: Date | null;
    assignedTo?: string[];
  }>;
  events: Array<{
    id: string;
    title: string;
    type: 'meeting' | 'deadline' | 'milestone' | 'reminder' | 'other';
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    location?: string | null;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

export function DayDetailModal({ date, tasks, events, isOpen, onClose }: DayDetailModalProps) {
  if (!date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalItems = tasks.length + events.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatDate(date)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {totalItems === 0 ? (
            <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks or events scheduled for this day</p>
            </div>
          ) : (
            <>
              {tasks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    <h3 className="font-medium text-foreground dark:text-foreground">
                      Tasks ({tasks.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {events.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    <h3 className="font-medium text-foreground dark:text-foreground">
                      Events ({events.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 