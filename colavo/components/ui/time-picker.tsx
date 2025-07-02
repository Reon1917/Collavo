'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

// Convert 24-hour to 12-hour format
const to12Hour = (hour24: number) => {
  if (hour24 === 0) return 12;
  if (hour24 > 12) return hour24 - 12;
  return hour24;
};

// Convert 12-hour to 24-hour format
const to24Hour = (hour12: number, isPM: boolean) => {
  if (hour12 === 12) return isPM ? 12 : 0;
  return isPM ? hour12 + 12 : hour12;
};

// Format time for display
const formatTimeDisplay = (hours: number, minutes: number) => {
  const hour12 = to12Hour(hours);
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, minutes] = value.split(':').map(Number);
  
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hour12Options = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minuteOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []); // 5-minute intervals
  const periodOptions = useMemo(() => ['AM', 'PM'], []);
  
  const currentHour12 = to12Hour(hours);
  const currentPeriod = hours >= 12 ? 'PM' : 'AM';

  useEffect(() => {
    if (isOpen && hoursRef.current && minutesRef.current && periodRef.current) {
      // Smooth scroll to current values
      const hourIndex = hour12Options.indexOf(currentHour12);
      const minuteIndex = minuteOptions.indexOf(minutes);
      const periodIndex = periodOptions.indexOf(currentPeriod);
      
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
  }, [isOpen, currentHour12, minutes, currentPeriod, hour12Options, minuteOptions, periodOptions]);

  const handleTimeChange = (newHour12?: number, newMinutes?: number, newPeriod?: string) => {
    const hour12 = newHour12 ?? currentHour12;
    const mins = newMinutes ?? minutes;
    const period = newPeriod ?? currentPeriod;
    
    const hour24 = to24Hour(hour12, period === 'PM');
    const formattedTime = `${hour24.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
        aria-label={`Select time, current time is ${formatTimeDisplay(hours, minutes)}`}
        className="w-full h-8 px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                   rounded-md shadow-sm hover:border-gray-400 dark:hover:border-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   flex items-center justify-between transition-colors"
      >
        <span className="text-gray-900 dark:text-gray-100">{formatTimeDisplay(hours, minutes)}</span>
        <Clock className="h-3.5 w-3.5 text-gray-400" />
      </button>

                    {isOpen && (
         <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
                         rounded-lg shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 z-50
                         animate-in slide-in-from-top-2 fade-in-0 duration-200">
           <style dangerouslySetInnerHTML={{
             __html: `
               .time-picker-scroll {
                 scrollbar-width: thin;
                 scrollbar-color: rgb(156 163 175) transparent;
               }
               .time-picker-scroll::-webkit-scrollbar {
                 width: 4px;
               }
               .time-picker-scroll::-webkit-scrollbar-track {
                 background: transparent;
               }
               .time-picker-scroll::-webkit-scrollbar-thumb {
                 background-color: rgb(156 163 175);
                 border-radius: 2px;
                 border: none;
               }
               .time-picker-scroll::-webkit-scrollbar-thumb:hover {
                 background-color: rgb(107 114 128);
               }
               .dark .time-picker-scroll {
                 scrollbar-color: rgb(75 85 99) transparent;
               }
               .dark .time-picker-scroll::-webkit-scrollbar-thumb {
                 background-color: rgb(75 85 99);
               }
               .dark .time-picker-scroll::-webkit-scrollbar-thumb:hover {
                 background-color: rgb(107 114 128);
               }
             `
           }} />
           <div className="flex divide-x divide-gray-200 dark:divide-gray-600">
             {/* Hours Column */}
             <div className="flex-1 p-2">
               <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center mb-2">
                 Hour
               </div>
               <div 
                 ref={hoursRef}
                 className="h-32 overflow-y-auto time-picker-scroll scroll-smooth"
               >
                 {hour12Options.map((hour) => (
                   <button
                     key={hour}
                     type="button"
                     onClick={() => handleTimeChange(hour)}
                     className={cn(
                       "w-full px-2 py-1.5 text-sm text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded",
                       hour === currentHour12 
                         ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" 
                         : "text-gray-700 dark:text-gray-300"
                     )}
                   >
                     {hour}
                   </button>
                 ))}
               </div>
             </div>

             {/* Minutes Column */}
             <div className="flex-1 p-2">
               <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center mb-2">
                 Minute
               </div>
               <div 
                 ref={minutesRef}
                 className="h-32 overflow-y-auto time-picker-scroll scroll-smooth"
               >
                 {minuteOptions.map((minute) => (
                   <button
                     key={minute}
                     type="button"
                     onClick={() => handleTimeChange(undefined, minute)}
                     className={cn(
                       "w-full px-2 py-1.5 text-sm text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded",
                       minute === minutes 
                         ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" 
                         : "text-gray-700 dark:text-gray-300"
                     )}
                   >
                     {minute.toString().padStart(2, '0')}
                   </button>
                 ))}
               </div>
             </div>

             {/* AM/PM Column */}
             <div className="flex-1 p-2">
               <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center mb-2">
                 Period
               </div>
               <div 
                 ref={periodRef}
                 className="h-32 overflow-y-auto time-picker-scroll scroll-smooth"
               >
                 {periodOptions.map((period) => (
                   <button
                     key={period}
                     type="button"
                     onClick={() => handleTimeChange(undefined, undefined, period)}
                     className={cn(
                       "w-full px-2 py-1.5 text-sm text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded",
                       period === currentPeriod 
                         ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" 
                         : "text-gray-700 dark:text-gray-300"
                     )}
                   >
                     {period}
                   </button>
                 ))}
               </div>
             </div>
           </div>
          
          <div className="p-2 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                         transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 