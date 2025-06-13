"use client";

import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Task {
  id: string;
  title: string;
  description: string | null;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  creatorEmail: string;
  subTasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  note: string | null;
  deadline: string | null;
  assignedId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
}

interface DeadlineTimelineChartProps {
  tasks: Task[];
  size: 'small' | 'large';
}

export function DeadlineTimelineChart({ tasks, size }: DeadlineTimelineChartProps) {
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

  // Define colors based on theme
  const textColor = isDarkMode ? '#F9FAFB' : '#374151';
  const gridColor = isDarkMode ? '#374151' : '#E5E7EB';

  const now = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneMonth = 30 * 24 * 60 * 60 * 1000;

  // Get all tasks with deadlines and categorize
  const tasksWithDeadlines = tasks.filter(task => task.deadline);
  
  if (tasksWithDeadlines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <div className="w-12 h-3 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">No deadlines set</p>
        </div>
      </div>
    );
  }

  // Categorize by urgency
  const categories = {
    overdue: 0,
    thisWeek: 0,
    thisMonth: 0,
    future: 0
  };

  tasksWithDeadlines.forEach(task => {
    const deadline = new Date(task.deadline!);
    const timeUntil = deadline.getTime() - now.getTime();
    
    if (timeUntil < 0) {
      categories.overdue++;
    } else if (timeUntil <= oneWeek) {
      categories.thisWeek++;
    } else if (timeUntil <= oneMonth) {
      categories.thisMonth++;
    } else {
      categories.future++;
    }
  });

  const data = {
    labels: ['Overdue', 'This Week', 'This Month', 'Future'],
    datasets: [
      {
        label: 'Tasks',
        data: [categories.overdue, categories.thisWeek, categories.thisMonth, categories.future],
        backgroundColor: ['#DC2626', '#EA580C', '#2563EB', '#059669'],
        borderColor: ['#B91C1C', '#C2410C', '#1D4ED8', '#047857'],
        borderWidth: 1,
      },
    ],
  };

  const height = size === 'small' ? 120 : 200;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${value} task${value !== 1 ? 's' : ''}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: textColor,
          font: { size: size === 'small' ? 10 : 11 },
        },
        grid: {
          color: gridColor,
        },
      },
      x: {
        ticks: {
          color: textColor,
          font: { size: size === 'small' ? 10 : 11 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-full">
      <div style={{ height: `${height}px` }}>
        <Bar data={data} options={options} />
      </div>
      
      {/* Summary for small size */}
      {size === 'small' && (
        <div className="mt-2 flex justify-between text-xs">
          <div className="text-center">
            <div className="font-semibold text-red-600">{categories.overdue}</div>
            <div className="text-gray-500">Overdue</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">{categories.thisWeek}</div>
            <div className="text-gray-500">This Week</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{categories.thisMonth}</div>
            <div className="text-gray-500">This Month</div>
          </div>
        </div>
      )}
    </div>
  );
} 