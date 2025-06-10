"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, BarChart3 } from 'lucide-react';

interface ViewSelectorProps {
  value: 'overview' | 'timeline' | 'graph';
  onChange: (value: 'overview' | 'timeline' | 'graph') => void;
}

export function ViewSelector({ value, onChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
      <Select value={value} onValueChange={(value) => onChange(value as 'overview' | 'timeline' | 'graph')}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="overview">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </div>
          </SelectItem>
          <SelectItem value="timeline">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Timeline View</span>
            </div>
          </SelectItem>
          <SelectItem value="graph">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Graph View</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 