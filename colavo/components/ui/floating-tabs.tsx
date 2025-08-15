"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, FileText, Calendar, FolderOpen, Users, ArrowLeft, Grid3X3, CheckSquare, CalendarDays, Files, UserCheck } from 'lucide-react';

interface FloatingTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  isSpecial?: boolean;
}

interface FloatingTabsProps {
  projectId: string;
  className?: string;
}

export function FloatingTabs({ projectId, className }: FloatingTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs: FloatingTab[] = [
    {
      id: 'back',
      label: 'Back to Dashboard',
      icon: <ArrowLeft className="h-5 w-5" />,
      href: '/dashboard',
      isSpecial: true
    },
    {
      id: 'overview',
      label: 'Overview',
      icon: <Grid3X3 className="h-5 w-5" />,
      href: `/project/${projectId}`
    },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: <CheckSquare className="h-5 w-5" />,
      href: `/project/${projectId}?tab=tasks`
    },
    {
      id: 'events',
      label: 'Schedule & Events',
      icon: <CalendarDays className="h-5 w-5" />,
      href: `/project/${projectId}?tab=events`
    },
    {
      id: 'files',
      label: 'Files & Documents',
      icon: <Files className="h-5 w-5" />,
      href: `/project/${projectId}?tab=files`
    },
    {
      id: 'members',
      label: 'Team Members',
      icon: <UserCheck className="h-5 w-5" />,
      href: `/project/${projectId}?tab=members`
    }
  ];

  const handleTabClick = (tab: FloatingTab) => {
    if (tab.href) {
      router.push(tab.href);
    }
    setIsExpanded(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const getActiveTab = () => {
    return tabs.find(tab => tab.id === currentTab) || tabs[1]; // Default to overview
  };

  const activeTab = getActiveTab();
  const otherTabs = tabs.filter(tab => tab.id !== activeTab.id);

  return (
    <div className={cn("fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40", className)}>
      <div className="relative flex flex-col items-center">
        {/* Bubble tabs appearing above */}
        <div
          className={cn(
            "absolute bottom-full mb-4 flex items-end justify-center gap-3 transition-all duration-500 ease-out",
            isExpanded 
              ? "opacity-100 scale-100 translate-y-0" 
              : "opacity-0 scale-90 translate-y-4 pointer-events-none"
          )}
        >
          {otherTabs.map((tab, index) => (
            <div
              key={tab.id}
              className="relative group"
              style={{
                transitionDelay: isExpanded ? `${index * 80}ms` : '0ms'
              }}
            >
              <button
                onClick={() => handleTabClick(tab)}
                aria-label={`Navigate to ${tab.label}`}
                className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full text-sm font-medium",
                  "bg-white dark:bg-gray-800 backdrop-blur-md border-2 border-gray-200/60 dark:border-gray-600/60",
                  "shadow-xl hover:shadow-2xl transform transition-all duration-300 cursor-pointer",
                  "text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF]",
                  "hover:scale-110 hover:border-[#008080]/50 dark:hover:border-[#00FFFF]/50",
                  "focus:outline-none focus:ring-4 focus:ring-[#008080]/30 dark:focus:ring-[#00FFFF]/30",
                  "active:scale-95 active:shadow-lg",
                  tab.isSpecial && "border-red-200 dark:border-red-600 hover:border-red-400 dark:hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
                )}
              >
                {tab.icon}
              </button>

              {/* Enhanced tooltip with arrow */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-gray-300 dark:text-gray-400 text-xs mt-0.5">
                    Click to navigate
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main floating tab - centered and prominent */}
        <div className="relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isExpanded}
            className={cn(
              "relative flex items-center gap-3 px-5 py-4 rounded-full text-sm font-medium transition-all duration-300",
              "bg-white dark:bg-gray-800 backdrop-blur-md border-2 border-gray-200/60 dark:border-gray-600/60",
              "shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer",
              "text-gray-900 dark:text-white",
              "focus:outline-none focus:ring-4 focus:ring-[#008080]/30 dark:focus:ring-[#00FFFF]/30",
              "active:scale-95",
              isExpanded && "bg-[#008080] dark:bg-[#008080] text-white border-[#008080] scale-105"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "transition-all duration-300",
                isExpanded ? "rotate-45 scale-110" : "rotate-0 scale-100"
              )}>
                {activeTab.icon}
              </div>
              <span className="hidden sm:inline font-medium">{activeTab.label.split(' ')[0]}</span>
            </div>
            
            {/* Navigation dots indicator */}
            <div className="flex flex-col items-center gap-0.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                isExpanded ? "bg-white scale-125" : "bg-[#008080] dark:bg-[#00FFFF] animate-pulse"
              )} />
              <div className={cn(
                "w-1 h-1 rounded-full transition-all duration-300 delay-75",
                isExpanded ? "bg-white/80" : "bg-[#008080]/70 dark:bg-[#00FFFF]/70"
              )} />
              <div className={cn(
                "w-0.5 h-0.5 rounded-full transition-all duration-300 delay-150",
                isExpanded ? "bg-white/60" : "bg-[#008080]/50 dark:bg-[#00FFFF]/50"
              )} />
            </div>

            {/* Subtle glow effect when expanded */}
            {isExpanded && (
              <div className="absolute inset-0 rounded-full bg-[#008080] opacity-20 animate-pulse" />
            )}
          </button>

          {/* Tooltip for current tab when collapsed */}
          {!isExpanded && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                {activeTab.label}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </div>
          )}
        </div>

        {/* Background overlay when expanded */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/5 dark:bg-black/10 -z-10 transition-opacity duration-300"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    </div>
  );
}
