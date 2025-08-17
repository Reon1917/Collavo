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
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, parseISO, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

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

interface GanttChartProps {
  tasks: Task[];
  size: 'small' | 'large';
}

interface GanttItem {
  id: string;
  title: string;
  parentTask: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedUser: string | null;
  isOverdue: boolean;
  type: 'subtask';
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

  // Get all subtasks with real dates
  const allSubTasks = tasks.flatMap(task => 
    task.subTasks.map(subTask => ({
      ...subTask,
      parentTask: task.title,
      parentTaskId: task.id,
      parentDeadline: task.deadline
    }))
  );

  if (allSubTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-muted-foreground dark:text-muted-foreground mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">No subtasks to display</p>
        </div>
      </div>
    );
  }

  const now = new Date();

  // Transform subtasks into Gantt items with real dates
  const ganttItems: GanttItem[] = allSubTasks.map(subTask => {
    // Use real creation date as start date
    const startDate = startOfDay(parseISO(subTask.createdAt));
    
    // Use real deadline as end date, fallback to parent task deadline, or default to 7 days from creation
    let endDate: Date;
    if (subTask.deadline) {
      endDate = endOfDay(parseISO(subTask.deadline));
    } else if (subTask.parentDeadline) {
      endDate = endOfDay(parseISO(subTask.parentDeadline));
    } else {
      // Default to 7 days from creation if no deadline is set
      endDate = endOfDay(addDays(startDate, 7));
    }

    const duration = Math.max(1, differenceInDays(endDate, startDate));
    const isOverdue = subTask.status !== 'completed' && endDate < now;

    return {
      id: subTask.id,
      title: `${subTask.parentTask}: ${subTask.title}`,
      parentTask: subTask.parentTask,
      startDate,
      endDate,
      duration,
      status: subTask.status,
      assignedUser: subTask.assignedUserName,
      isOverdue,
      type: 'subtask' as const
    };
  });

  // Sort by start date to show chronological order
  ganttItems.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Find project date range
  const projectStart = ganttItems.length > 0 ? ganttItems[0]!.startDate : new Date();
  const projectEnd = ganttItems.length > 0 ? 
    new Date(Math.max(...ganttItems.map(item => item.endDate.getTime()))) : 
    new Date();

  // Prepare labels for y-axis (task names)
  const labels = ganttItems.map(item => {
    const shortTitle = item.title.length > 40 ? `${item.title.substring(0, 40)}...` : item.title;
    return shortTitle;
  });

  // Color coding based on status and overdue state
  const getColor = (item: GanttItem) => {
    if (item.isOverdue) return '#DC2626'; // Red for overdue
    switch (item.status) {
      case 'completed': return '#059669'; // Green
      case 'in_progress': return '#D97706'; // Amber
      case 'pending': return '#6B7280'; // Gray
      default: return '#6B7280';
    }
  };

  const getBorderColor = (item: GanttItem) => {
    if (item.isOverdue) return '#B91C1C';
    switch (item.status) {
      case 'completed': return '#047857';
      case 'in_progress': return '#B45309';
      case 'pending': return '#4B5563';
      default: return '#4B5563';
    }
  };

  // Create timeline data - each bar represents [start_time, end_time] for proper positioning
  const data = {
    labels,
    datasets: [
      {
        label: 'Task Timeline',
        data: ganttItems.map((item, index) => ({
          x: [item.startDate.getTime(), item.endDate.getTime()],
          y: index,
        })),
        backgroundColor: ganttItems.map(item => getColor(item)),
        borderColor: ganttItems.map(item => getBorderColor(item)),
        borderWidth: 1,
        barThickness: size === 'small' ? 16 : 24,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ],
  };

  const height = size === 'small' ? Math.min(400, Math.max(250, ganttItems.length * 30)) : 
                                   Math.min(700, Math.max(450, ganttItems.length * 40));

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
        text: 'Project Timeline - Subtasks',
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
        borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
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
            return dataIndex !== undefined ? ganttItems[dataIndex]?.title || 'Task' : 'Task';
          },
          label: function(context) {
            const dataIndex = context.dataIndex;
            const item = ganttItems[dataIndex];
            if (!item) return '';
            
            const startDate = format(item.startDate, 'MMM dd, yyyy');
            const endDate = format(item.endDate, 'MMM dd, yyyy');
            const statusText = item.status.replace('_', ' ').toUpperCase();
            
            const lines = [
              `Status: ${statusText}`,
              `Start: ${startDate}`,
              `End: ${endDate}`,
              `Duration: ${item.duration} days`
            ];

            if (item.assignedUser) {
              lines.push(`Assigned: ${item.assignedUser}`);
            }

            if (item.isOverdue) {
              lines.push('⚠️ OVERDUE');
            }

            return lines;
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
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy'
          },
          tooltipFormat: 'MMM dd, yyyy'
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
          maxRotation: 45,
        },
        grid: {
          color: gridColor,
        },
        min: projectStart.getTime(),
        max: projectEnd.getTime(),
      },
      y: {
        title: {
          display: size === 'large',
          text: 'Subtasks',
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
            size: size === 'small' ? 9 : 10,
          },
          maxRotation: 0,
          callback: function(value) {
            const index = Number(value);
            const item = ganttItems[index];
            if (!item) return '';
            
            // Show just the subtask title for y-axis
            const parts = item.title.split(': ');
            const subtaskTitle = parts.length > 1 ? parts[1] : parts[0];
            if (!subtaskTitle) return '';
            return subtaskTitle.length > 25 ? `${subtaskTitle.substring(0, 25)}...` : subtaskTitle;
          },
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  // Calculate statistics
  const completedCount = ganttItems.filter(item => item.status === 'completed').length;
  const inProgressCount = ganttItems.filter(item => item.status === 'in_progress').length;
  const pendingCount = ganttItems.filter(item => item.status === 'pending').length;
  const overdueCount = ganttItems.filter(item => item.isOverdue).length;
  const totalDuration = differenceInDays(projectEnd, projectStart);

  return (
    <div className="relative h-full">
      <div style={{ height: `${height}px`, position: 'relative' }}>
        <Bar data={data} options={options} />
      </div>

      {/* Legend for task status */}
      <div className="mt-4 flex justify-center gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
          <span className="text-foreground">Completed ({completedCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-600 rounded"></div>
          <span className="text-foreground">In Progress ({inProgressCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span className="text-foreground">Pending ({pendingCount})</span>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-foreground">Overdue ({overdueCount})</span>
          </div>
        )}
      </div>

      {/* Additional info for large size */}
      {size === 'large' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted dark:bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-foreground dark:text-foreground mb-2">Timeline Overview</h4>
            <div className="space-y-1 text-muted-foreground">
              <p>Total Subtasks: {ganttItems.length}</p>
              <p>Project Start: {format(projectStart, 'MMM dd, yyyy')}</p>
              <p>Project End: {format(projectEnd, 'MMM dd, yyyy')}</p>
              <p>Total Duration: {totalDuration} days</p>
            </div>
          </div>
          
          <div className="bg-muted dark:bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-foreground dark:text-foreground mb-2">Progress Summary</h4>
            <div className="space-y-1 text-muted-foreground">
              <p>Completed: {completedCount} ({Math.round((completedCount / ganttItems.length) * 100)}%)</p>
              <p>In Progress: {inProgressCount} ({Math.round((inProgressCount / ganttItems.length) * 100)}%)</p>
              <p>Pending: {pendingCount} ({Math.round((pendingCount / ganttItems.length) * 100)}%)</p>
              {overdueCount > 0 && (
                <p className="text-red-600 dark:text-red-400">Overdue: {overdueCount}</p>
              )}
            </div>
          </div>
          
          <div className="bg-muted dark:bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-foreground dark:text-foreground mb-2">Task Distribution</h4>
            <div className="space-y-1 text-muted-foreground">
              <p>Main Tasks: {tasks.length}</p>
              <p>Subtasks: {ganttItems.length}</p>
              <p>Avg per Task: {Math.round(ganttItems.length / tasks.length * 10) / 10}</p>
              <p>Assigned: {ganttItems.filter(item => item.assignedUser).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 