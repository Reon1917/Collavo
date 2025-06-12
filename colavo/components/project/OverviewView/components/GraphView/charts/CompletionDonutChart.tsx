"use client";

import { Doughnut } from 'react-chartjs-2';
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
  subTasks: Array<{
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

interface CompletionDonutChartProps {
  tasks: Task[];
  size: 'small' | 'large';
}

export function CompletionDonutChart({ tasks, size }: CompletionDonutChartProps) {
  // Calculate completion data
  const totalSubTasks = tasks.reduce((total, task) => total + task.subTasks.length, 0);
  const completedSubTasks = tasks.reduce((total, task) => {
    return total + task.subTasks.filter(st => st.status === 'completed').length;
  }, 0);
  const inProgressSubTasks = tasks.reduce((total, task) => {
    return total + task.subTasks.filter(st => st.status === 'in_progress').length;
  }, 0);
  const pendingSubTasks = tasks.reduce((total, task) => {
    return total + task.subTasks.filter(st => st.status === 'pending').length;
  }, 0);

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

  const data = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [completedSubTasks, inProgressSubTasks, pendingSubTasks],
        backgroundColor: [
          '#059669', // Emerald green for completed
          '#D97706', // Amber for in progress
          '#DC2626', // Red for pending
        ],
        borderColor: [
          '#047857',
          '#B45309',
          '#B91C1C',
        ],
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
          color: '#374151',
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
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              {completedSubTasks}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              {inProgressSubTasks}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">
              {pendingSubTasks}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 