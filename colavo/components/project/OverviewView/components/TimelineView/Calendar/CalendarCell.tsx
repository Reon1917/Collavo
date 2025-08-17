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

  const handleItemClick = (item: CalendarItemType) => {
    onItemClick(item);
  };

  return (
    <div
      className={`
        group relative min-h-[120px] border border-border dark:border-border p-2 cursor-pointer
        transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md
        hover:border-blue-300 dark:hover:border-blue-600 hover:z-10
        ${!isCurrentMonth ? 'opacity-40 hover:opacity-60' : ''}
        ${isToday 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
          : 'bg-background dark:bg-card/50 hover:bg-muted dark:hover:bg-muted/50'
        }
      `}
      onClick={handleCellClick}
    >
      {/* Date number */}
      <div className={`
        text-sm font-medium mb-2 transition-all duration-200
        ${isToday 
          ? 'text-blue-600 dark:text-blue-400 font-semibold' 
          : 'text-foreground  group-hover:text-blue-600 dark:group-hover:text-blue-400'
        }
      `}>
        {date.getDate()}
      </div>
      
      {/* Items container */}
      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
        {visibleItems.map((item) => (
          <CalendarItem
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item)}
          />
        ))}
        
        {hiddenCount > 0 && (
          <div className="text-xs font-medium text-muted-foreground dark:text-muted-foreground px-2 py-1 bg-muted dark:bg-muted rounded border transition-all duration-200 hover:bg-muted dark:hover:bg-gray-700">
            +{hiddenCount} more
          </div>
        )}
      </div>
    </div>
  );
} 