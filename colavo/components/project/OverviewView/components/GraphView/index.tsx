"use client";

import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export function GraphView() {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900/20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full">
            <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Graph View
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Coming soon! This view will show project analytics, progress charts, and data visualizations.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span>Progress Charts</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Timeline Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
} 