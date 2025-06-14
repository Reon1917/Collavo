"use client";

import { Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Task {
  deadline?: string | null;
  subTasks: Array<{
    status: 'pending' | 'in_progress' | 'completed';
    deadline?: string | null;
  }>;
}

interface CompletionDonutChartProps {
  tasks: Task[];
  size: 'small' | 'large';
}

export function CompletionDonutChart({ tasks, size }: CompletionDonutChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const now = new Date();
  
  // Define colors based on theme
  const textColor = isDarkMode ? '#F9FAFB' : '#374151';
  
  // Calculate completion data with overdue logic
  const totalSubTasks = tasks.reduce((total, task) => total + task.subTasks.length, 0);
  const completedSubTasks = tasks.reduce((total, task) => {
    return total + task.subTasks.filter(st => st.status === 'completed').length;
  }, 0);
  
  // Calculate overdue, in progress, and pending separately
  let overdueSubTasks = 0;
  let inProgressSubTasks = 0;
  let pendingSubTasks = 0;
  
  tasks.forEach(task => {
    task.subTasks.forEach(subTask => {
      if (subTask.status === 'completed') {
        return; // Already counted in completedSubTasks
      }
      
      // Check if task is overdue (past deadline and not completed)
      const deadline = subTask.deadline || task.deadline;
      const isOverdue = deadline && new Date(deadline) < now;
      
      if (isOverdue) {
        overdueSubTasks++;
      } else if (subTask.status === 'in_progress') {
        inProgressSubTasks++;
      } else if (subTask.status === 'pending') {
        pendingSubTasks++;
      }
    });
  });

  if (totalSubTasks === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">No tasks created yet</p>
        </div>
      </div>
    );
  }

  const completionPercentage = Math.round((completedSubTasks / totalSubTasks) * 100);

  // Only include categories that have data
  const labels: string[] = [];
  const dataValues: number[] = [];
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];

  if (completedSubTasks > 0) {
    labels.push('Completed');
    dataValues.push(completedSubTasks);
    backgroundColors.push('#059669'); // Emerald green
    borderColors.push('#047857');
  }

  if (inProgressSubTasks > 0) {
    labels.push('In Progress');
    dataValues.push(inProgressSubTasks);
    backgroundColors.push('#D97706'); // Amber
    borderColors.push('#B45309');
  }

  if (pendingSubTasks > 0) {
    labels.push('Pending');
    dataValues.push(pendingSubTasks);
    backgroundColors.push('#6B7280'); // Gray
    borderColors.push('#4B5563');
  }

  if (overdueSubTasks > 0) {
    labels.push('Overdue');
    dataValues.push(overdueSubTasks);
    backgroundColors.push('#DC2626'); // Red
    borderColors.push('#B91C1C');
  }

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        cutout: '70%', // Makes it a donut chart
      },
    ],
  };

  const height = size === 'small' ? 180 : 280;

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: size === 'large',
        position: 'right' as const,
        labels: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: size === 'small' ? 11 : 12,
          },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 12,
          weight: 'bold',
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 11,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = Math.round((value / totalSubTasks) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      duration: 800,
      easing: 'easeOutQuart',
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="relative h-full">
      <div style={{ height: `${height}px`, position: 'relative' }}>
        <Doughnut data={data} options={options} />
        
        {/* Center completion percentage for donut chart */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {completionPercentage}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              Complete
            </div>
          </div>
        </div>
      </div>

      {/* Simple legend for small size */}
      {size === 'small' && (
        <div className="mt-3 flex justify-center gap-3 text-xs flex-wrap">
          {completedSubTasks > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                {completedSubTasks}
              </span>
            </div>
          )}
          {inProgressSubTasks > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-amber-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                {inProgressSubTasks}
              </span>
            </div>
          )}
          {pendingSubTasks > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gray-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                {pendingSubTasks}
              </span>
            </div>
          )}
          {overdueSubTasks > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                {overdueSubTasks}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Overdue warning for small size */}
      {size === 'small' && overdueSubTasks > 0 && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            ⚠️ {overdueSubTasks} overdue task{overdueSubTasks !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
} 