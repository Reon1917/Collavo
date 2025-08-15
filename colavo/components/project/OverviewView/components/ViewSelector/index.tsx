"use client";

import { useState, useEffect } from 'react';
import { Calendar, BarChart3, Grid3X3, TrendingUp, Users, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewSelectorProps {
  value: 'overview' | 'timeline' | 'graph';
  onChange: (value: 'overview' | 'timeline' | 'graph') => void;
}

interface ViewOption {
  id: 'overview' | 'timeline' | 'graph';
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const viewOptions: ViewOption[] = [
  {
    id: 'overview',
    title: 'Project Overview',
    description: 'Quick summary with key metrics and recent activity',
    icon: <Grid3X3 className="h-5 w-5" />,
    features: ['Task Progress', 'Team Members', 'Recent Activity'],
    color: 'bg-blue-500'
  },
  {
    id: 'timeline',
    title: 'Calendar Timeline',
    description: 'Visual calendar showing tasks and events by date',
    icon: <Calendar className="h-5 w-5" />,
    features: ['Due Dates', 'Events Schedule', 'Daily Planning'],
    color: 'bg-green-500'
  },
  {
    id: 'graph',
    title: 'Analytics & Charts',
    description: 'Data visualization and project performance metrics',
    icon: <TrendingUp className="h-5 w-5" />,
    features: ['Progress Charts', 'Team Analytics', 'Performance Insights'],
    color: 'bg-purple-500'
  }
];

export function ViewSelector({ value, onChange }: ViewSelectorProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {viewOptions.find(opt => opt.id === value)?.title || 'Project Overview'}
      </h2>
      
      {/* Compact toggle switch */}
      <div className="relative">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
          {viewOptions.map((option) => (
            <div key={option.id} className="relative">
              <button
                onClick={() => onChange(option.id)}
                onMouseEnter={() => setShowTooltip(option.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#008080]/50 dark:focus:ring-[#00FFFF]/50",
                  value === option.id
                    ? "bg-[#008080] text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                )}
                aria-label={`Switch to ${option.title}`}
              >
                {option.icon}
                <span className="hidden sm:inline">{option.title.split(' ')[0]}</span>
              </button>

              {/* Tooltip */}
              {showTooltip === option.id && value !== option.id && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="font-medium">{option.title}</div>
                    <div className="text-gray-300 dark:text-gray-400 text-xs mt-0.5">
                      {option.description}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active indicator dot */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#008080] rounded-full animate-pulse"></div>
      </div>
    </div>
  );
} 