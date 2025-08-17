'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollbarStylesCSS } from './scrollbar-styles';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

// Parse 24-hour time string to 12-hour components
const parseTime = (timeString: string) => {
  const parts = timeString.split(':');
  const hour24 = parseInt(parts[0] ?? '0', 10) || 0;
  const minutes = parseInt(parts[1] ?? '0', 10) || 0;
  
  const isPM = hour24 >= 12;
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  
  return { hour12, minutes, isPM };
};

// Convert 12-hour format back to 24-hour time string
const formatTime24 = (hour12: number, minutes: number, isPM: boolean): string => {
  let hour24: number;
  if (hour12 === 12) {
    hour24 = isPM ? 12 : 0;
  } else {
    hour24 = isPM ? hour12 + 12 : hour12;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Format for display
const formatTimeDisplay = (hour12: number, minutes: number, isPM: boolean): string => {
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
};

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse current time
  const { hour12, minutes, isPM } = parseTime(value);
  
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hour12Options = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minuteOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []); // 5-minute intervals
  const periodOptions = useMemo(() => ['AM', 'PM'], []);

  useEffect(() => {
    if (isOpen && hoursRef.current && minutesRef.current && periodRef.current) {
      // Smooth scroll to current values
      const hourIndex = hour12Options.indexOf(hour12);
      const minuteIndex = minuteOptions.indexOf(minutes);
      const periodIndex = periodOptions.indexOf(isPM ? 'PM' : 'AM');
      
      if (hourIndex >= 0) {
        const hourElement = hoursRef.current.children[hourIndex] as HTMLElement;
        if (hourElement) {
          hoursRef.current.scrollTo({
            top: hourElement.offsetTop - hoursRef.current.offsetHeight / 2 + hourElement.offsetHeight / 2,
            behavior: 'smooth'
          });
        }
      }
      
      if (minuteIndex >= 0) {
        const minuteElement = minutesRef.current.children[minuteIndex] as HTMLElement;
        if (minuteElement) {
          minutesRef.current.scrollTo({
            top: minuteElement.offsetTop - minutesRef.current.offsetHeight / 2 + minuteElement.offsetHeight / 2,
            behavior: 'smooth'
          });
        }
      }
      
      if (periodIndex >= 0) {
        const periodElement = periodRef.current.children[periodIndex] as HTMLElement;
        if (periodElement) {
          periodRef.current.scrollTo({
            top: periodElement.offsetTop - periodRef.current.offsetHeight / 2 + periodElement.offsetHeight / 2,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [isOpen, hour12, minutes, isPM, hour12Options, minuteOptions, periodOptions]);

  const handleTimeChange = (newHour12?: number, newMinutes?: number, newPeriod?: string) => {
    const finalHour12 = newHour12 ?? hour12;
    const finalMinutes = newMinutes ?? minutes;
    const finalIsPM = newPeriod ? newPeriod === 'PM' : isPM;
    
    const formattedTime = formatTime24(finalHour12, finalMinutes, finalIsPM);
    onChange(formattedTime);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select time, current time is ${formatTimeDisplay(hour12, minutes, isPM)}`}
        className="w-full h-8 px-3 py-1 text-sm bg-background dark:bg-muted border border-border dark:border-gray-600 rounded-md shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between transition-colors"
      >
        <span className="text-foreground">{formatTimeDisplay(hour12, minutes, isPM)}</span>
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-border dark:border-gray-600 rounded-lg shadow-lg backdrop-blur-sm bg-background/95 dark:bg-muted/95 z-50 animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <ScrollbarStylesCSS />
          <div className="flex divide-x divide-gray-200 dark:divide-gray-600">
            {/* Hours Column */}
            <div className="flex-1 p-2">
              <div className="text-xs font-medium text-muted-foreground dark:text-muted-foreground text-center mb-2">
                Hour
              </div>
              <div 
                ref={hoursRef}
                className="h-32 overflow-y-auto scrollbar-thin scroll-smooth"
              >
                {hour12Options.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeChange(hour)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm text-center hover:bg-muted dark:hover:bg-gray-700 transition-colors rounded",
                      hour === hour12 
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" 
                        : "text-foreground "
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1 p-2">
              <div className="text-xs font-medium text-muted-foreground dark:text-muted-foreground text-center mb-2">
                Minute
              </div>
              <div 
                ref={minutesRef}
                className="h-32 overflow-y-auto scrollbar-thin scroll-smooth"
              >
                {minuteOptions.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeChange(undefined, minute)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm text-center hover:bg-muted dark:hover:bg-gray-700 transition-colors rounded",
                      minute === minutes 
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" 
                        : "text-foreground "
                    )}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM Column */}
            <div className="flex-1 p-2">
              <div className="text-xs font-medium text-muted-foreground dark:text-muted-foreground text-center mb-2">
                Period
              </div>
              <div 
                ref={periodRef}
                className="h-32 overflow-y-auto scrollbar-thin scroll-smooth"
              >
                {periodOptions.map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => handleTimeChange(undefined, undefined, period)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm text-center hover:bg-muted dark:hover:bg-gray-700 transition-colors rounded",
                      period === (isPM ? 'PM' : 'AM')
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" 
                        : "text-foreground "
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 