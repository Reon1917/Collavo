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
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Task {
  id: string;
  title: string;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  subTasks: Array<{
    id: string;
    status: 'pending' | 'in_progress' | 'completed';
    assignedId: string | null;
    assignedUserName: string | null;
  }>;
  // For Gantt chart, we'll simulate dates based on task creation and status
  createdAt?: Date;
  dueDate?: Date;
}

interface GanttChartProps {
  tasks: Task[];
  size: 'small' | 'large';
}

export function GanttChart({ tasks, size }: GanttChartProps) {
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

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">No tasks to display</p>
        </div>
      </div>
    );
  }

  // Generate timeline data for tasks
  const today = startOfDay(new Date());
  const projectStart = today;
  
  // Create timeline data for each task
  const timelineData = tasks.map((task, index) => {
    // Simulate start and end dates based on task properties
    const taskStart = addDays(projectStart, index * 1); // Reduced stagger
    const baseDuration = task.importanceLevel === 'critical' ? 1 : 
                        task.importanceLevel === 'high' ? 2 : 
                        task.importanceLevel === 'medium' ? 3 : 4; // Much shorter durations
    
    // Adjust duration based on subtask count but keep it very short
    const subtaskBonus = Math.min(Math.ceil(task.subTasks.length * 0.3), 2); // Max +2 days
    const duration = baseDuration + subtaskBonus;
    const taskEnd = addDays(taskStart, duration);
    
    // Calculate progress based on completed subtasks
    const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
    const totalSubTasks = task.subTasks.length || 1;
    const progress = (completedSubTasks / totalSubTasks) * 100;
    
    return {
      taskId: task.id,
      title: task.title,
      start: taskStart,
      end: taskEnd,
      duration,
      progress,
      status: completedSubTasks === totalSubTasks ? 'completed' : 
              task.subTasks.some(st => st.status === 'in_progress') ? 'in_progress' : 'pending',
      importance: task.importanceLevel,
      startOffset: differenceInDays(taskStart, projectStart),
    };
  });

  // Prepare data for horizontal bar chart
  const labels = timelineData.map(item => 
    item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title
  );

  const backgroundColors = timelineData.map(item => {
    switch (item.status) {
      case 'completed': return '#059669'; // Green
      case 'in_progress': return '#D97706'; // Amber
      default: return '#DC2626'; // Red
    }
  });

  const borderColors = timelineData.map(item => {
    switch (item.status) {
      case 'completed': return '#047857';
      case 'in_progress': return '#B45309';
      default: return '#B91C1C';
    }
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Task Duration',
        data: timelineData.map(item => item.duration),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        barThickness: size === 'small' ? 20 : 30,
      },
    ],
  };

  const height = size === 'small' ? 200 : 400;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: size === 'large',
        text: 'Project Timeline',
        color: textColor,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
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
          title: function(context) {
            const dataIndex = context[0]?.dataIndex;
            return dataIndex !== undefined ? timelineData[dataIndex]?.title || 'Task' : 'Task';
          },
          label: function(context) {
            const dataIndex = context.dataIndex;
            const task = timelineData[dataIndex];
            if (!task) return '';
            
            const startDate = new Date(task.start).toLocaleDateString();
            const endDate = new Date(task.end).toLocaleDateString();
            const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
            
            return [
              `Duration: ${duration} days`,
              `Start: ${startDate}`,
              `End: ${endDate}`,
              `Progress: ${Math.round(task.progress)}%`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        title: {
          display: size === 'large',
          text: 'Timeline',
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 'bold',
          },
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: size === 'small' ? 10 : 11,
          },
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        title: {
          display: size === 'large',
          text: 'Tasks',
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: size === 'small' ? 10 : 11,
          },
          callback: function(value) {
            const index = Number(value);
            return timelineData[index]?.title || '';
          },
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="relative h-full">
      <div style={{ height: `${height}px`, position: 'relative' }}>
        <Bar data={data} options={options} />
      </div>

      {/* Legend for task status */}
      <div className="mt-4 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-600 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-600 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Pending</span>
        </div>
      </div>

      {/* Additional info for large size */}
      {size === 'large' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Timeline Overview</h4>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <p>Total Tasks: {tasks.length}</p>
              <p>Project Start: {format(projectStart, 'MMM dd, yyyy')}</p>
              <p>Estimated Duration: {Math.max(...timelineData.map(t => t.startOffset + t.duration))} days</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Progress Summary</h4>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <p>Completed: {timelineData.filter(t => t.status === 'completed').length}</p>
              <p>In Progress: {timelineData.filter(t => t.status === 'in_progress').length}</p>
              <p>Pending: {timelineData.filter(t => t.status === 'pending').length}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Priority Breakdown</h4>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <p>Critical: {tasks.filter(t => t.importanceLevel === 'critical').length}</p>
              <p>High: {tasks.filter(t => t.importanceLevel === 'high').length}</p>
              <p>Medium: {tasks.filter(t => t.importanceLevel === 'medium').length}</p>
              <p>Low: {tasks.filter(t => t.importanceLevel === 'low').length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 