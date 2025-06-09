"use client";

import { useState } from 'react';
import { Calendar } from './Calendar';
import { DayDetailModal } from './DayDetailModal';
import type { CalendarItem } from './Calendar/CalendarItem';
import type { Task, Event } from '@/types';

interface TimelineViewProps {
  tasks: Task[];
  events: Event[];
}

export function TimelineView({ tasks, events }: TimelineViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform tasks and events into calendar items with proper date handling
  const calendarItems: CalendarItem[] = [
    ...tasks.filter(task => task.dueDate || task.startDate).map(task => {
      const taskDate = task.dueDate || task.startDate!;
      return {
        id: task.id,
        title: task.title,
        type: 'task' as const,
        time: taskDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        priority: task.importance as 'low' | 'medium' | 'high' | 'critical',
        dueDate: taskDate,
        startDate: taskDate,
      };
    }),
    ...events.map(event => ({
      id: event.id,
      title: event.title,
      type: 'event' as const,
      time: event.isAllDay ? 'All day' : event.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      eventType: event.type,
      startDate: event.startDate,
    }))
  ];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleItemClick = (item: CalendarItem) => {
    // For now, just show the day detail
    // In the future, this could navigate to the specific task/event
    const itemDate = item.startDate || item.dueDate;
    if (itemDate) {
      setSelectedDate(itemDate);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // Get tasks and events for the selected date
  const getItemsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    
    const dayTasks = tasks.filter(task => {
      const taskDate = task.dueDate || task.startDate;
      return taskDate && taskDate.toDateString() === dateStr;
    });

    const dayEvents = events.filter(event => {
      return event.startDate.toDateString() === dateStr;
    });

    return { tasks: dayTasks, events: dayEvents };
  };

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : { tasks: [], events: [] };

  return (
    <div className="space-y-6">
      <Calendar
        items={calendarItems}
        onDateClick={handleDateClick}
        onItemClick={handleItemClick}
      />

      <DayDetailModal
        date={selectedDate}
        tasks={selectedDateItems.tasks.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          importance: task.importance,
          dueDate: task.dueDate || null,
          assignedTo: task.assignedTo,
        }))}
        events={selectedDateItems.events.map(event => ({
          id: event.id,
          title: event.title,
          type: event.type,
          startDate: event.startDate,
          endDate: event.endDate,
          isAllDay: event.isAllDay,
          location: event.location || null,
        }))}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
} 