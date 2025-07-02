'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, minutes] = value.split(':').map(Number);
  
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isOpen && hoursRef.current && minutesRef.current) {
      // Smooth scroll to current values
      const hourElement = hoursRef.current.children[hours] as HTMLElement;
      const minuteElement = minutesRef.current.children[minutes] as HTMLElement;
      
      if (hourElement) {
        hoursRef.current.scrollTo({
          top: hourElement.offsetTop - hoursRef.current.offsetHeight / 2 + hourElement.offsetHeight / 2,
          behavior: 'smooth'
        });
      }
      
      if (minuteElement) {
        minutesRef.current.scrollTo({
          top: minuteElement.offsetTop - minutesRef.current.offsetHeight / 2 + minuteElement.offsetHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [isOpen, hours, minutes]);

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const formattedTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  };

  const handleWheel = (e: React.WheelEvent, type: 'hours' | 'minutes') => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    
    if (type === 'hours') {
      const newHours = Math.max(0, Math.min(23, hours + delta));
      handleTimeChange(newHours, minutes);
    } else {
      const newMinutes = Math.max(0, Math.min(59, minutes + delta));
      handleTimeChange(hours, newMinutes);
    }
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
        aria-label={`Select time, current time is ${value}`}
        className="w-full h-8 px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                   rounded-md shadow-sm hover:border-gray-400 dark:hover:border-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   flex items-center justify-between transition-colors"
      >
        <span className="text-gray-900 dark:text-gray-100">{value}</span>
        <Clock className="h-3.5 w-3.5 text-gray-400" />
      </button>

             {isOpen && (
         <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
                         rounded-lg shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 z-50
                         animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <div className="flex divide-x divide-gray-200 dark:divide-gray-600">
            {/* Hours Column */}
            <div className="flex-1 p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center mb-2">
                Hours
              </div>
                             <div 
                 ref={hoursRef}
                 className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 
                           scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500
                           scroll-smooth"
                 onWheel={(e) => handleWheel(e, 'hours')}
               >
                {hourOptions.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeChange(hour, minutes)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      hour === hours 
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" 
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1 p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center mb-2">
                Minutes
              </div>
                             <div 
                 ref={minutesRef}
                 className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                           scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500
                           scroll-smooth"
                 onWheel={(e) => handleWheel(e, 'minutes')}
               >
                {minuteOptions.filter(m => m % 5 === 0).map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeChange(hours, minute)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
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