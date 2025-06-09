"use client";

import { CalendarItem } from './CalendarItem';
import type { CalendarItem as CalendarItemType } from './CalendarItem';

interface CalendarCellProps {
  date: Date;
  items: CalendarItemType[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDateClick: (date: Date) => void;
  onItemClick: (item: CalendarItemType) => void;
}

export function CalendarCell({ 
  date, 
  items, 
  isCurrentMonth, 
  isToday, 
  onDateClick,
  onItemClick 
}: CalendarCellProps) {
  const maxVisibleItems = 2;
  const visibleItems = items.slice(0, maxVisibleItems);
  const hiddenCount = items.length - maxVisibleItems;

  const handleCellClick = () => {
    onDateClick(date);
  };

  const handleItemClick = (item: CalendarItemType, e: React.MouseEvent) => {
    e.stopPropagation();
    onItemClick(item);
  };

  return (
    <div
      className={`
        min-h-[120px] border border-gray-200 dark:border-gray-700 p-2 cursor-pointer
        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
        ${!isCurrentMonth ? 'opacity-40' : ''}
        ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : 'bg-white dark:bg-gray-900/50'}
      `}
      onClick={handleCellClick}
    >
      <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
        {date.getDate()}
      </div>
      
      <div className="space-y-1">
        {visibleItems.map((item) => (
          <CalendarItem
            key={item.id}
            item={item}
            onClick={(e) => handleItemClick(item, e as any)}
          />
        ))}
        
        {hiddenCount > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
            +{hiddenCount} more
          </div>
        )}
      </div>
    </div>
  );
} 