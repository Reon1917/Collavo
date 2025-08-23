"use client";

import { motion } from 'motion/react';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface ViewTabsProps {
  value: 'overview' | 'timeline' | 'graph';
  onChange: (value: 'overview' | 'timeline' | 'graph') => void;
}

const tabs = [
  {
    id: 'overview' as const,
    label: 'Project View',
    icon: BarChart3,
    description: 'Overview and metrics'
  },
  {
    id: 'timeline' as const,
    label: 'Timeline View',
    icon: Calendar,
    description: 'Calendar and scheduling'
  },
  {
    id: 'graph' as const,
    label: 'Analytics',
    icon: TrendingUp,
    description: 'Charts and insights'
  }
];

export function ViewTabs({ value, onChange }: ViewTabsProps) {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-card rounded-md shadow-sm border border-border"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
            
            <div className="relative z-10 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
