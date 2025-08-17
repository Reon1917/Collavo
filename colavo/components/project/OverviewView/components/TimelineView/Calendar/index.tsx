"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarCell } from './CalendarCell';
import type { CalendarItem } from './CalendarItem';

interface CalendarProps {
  items: CalendarItem[];
  onDateClick: (date: Date) => void;
  onItemClick: (item: CalendarItem) => void;
}

export function Calendar({ items, onDateClick, onItemClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month and adjust for Sunday start
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Get last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Calculate days to show (including previous/next month days)
  const daysToShow: Date[] = [];

  // Previous month days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysToShow.push(new Date(year, month - 1, prevMonth.getDate() - i));
  }

  // Current month days
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    daysToShow.push(new Date(year, month, day));
  }

  // Next month days to complete the grid (6 weeks = 42 days)
  const remainingDays = 42 - daysToShow.length;
  for (let day = 1; day <= remainingDays; day++) {
    daysToShow.push(new Date(year, month + 1, day));
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getItemsForDate = (date: Date): CalendarItem[] => {
    const targetDate = date.toDateString();
    return items.filter(item => {
      // For tasks, check dueDate; for events, check startDate
      const itemDate = item.type === 'task' 
        ? item.dueDate || item.startDate
        : item.startDate;
      
      if (!itemDate) return false;
      
      const itemDateStr = itemDate.toDateString();
      return itemDateStr === targetDate;
    });
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-background dark:bg-card border border-border dark:border-border rounded-lg shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border dark:border-border bg-muted dark:bg-muted">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground">
            {monthNames[month]} {year}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-sm transition-all duration-200 hover:scale-105"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border dark:border-border">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium bg-muted dark:bg-muted transition-colors duration-200 ${
              index === 0 || index === 6 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-foreground '
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {daysToShow.map((date, index) => (
          <CalendarCell
            key={index}
            date={date}
            items={getItemsForDate(date)}
            isCurrentMonth={isCurrentMonth(date)}
            isToday={isToday(date)}
            onDateClick={onDateClick}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
} 