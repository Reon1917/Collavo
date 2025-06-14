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
  subTasks: Array<{
    assignedId: string | null;
    assignedUserName: string | null;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

interface Project {
  members: Array<{
    userId: string;
    userName: string;
  }>;
}

interface WorkloadBarChartProps {
  project: Project | undefined;
  tasks: Task[];
  size: 'small' | 'large';
}

export function WorkloadBarChart({ project, tasks, size }: WorkloadBarChartProps) {
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

  // Early return for no data
  if (!project?.members || project.members.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-black-400 dark:text-gray-500 mb-2">
            <div className="w-12 h-3 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-8 h-3 mx-auto bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
            <div className="w-10 h-3 mx-auto bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">No team members</p>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <div className="w-12 h-3 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">No task assignments</p>
        </div>
      </div>
    );
  }

  // Calculate workload data for each member with safe access and validation
  const workloadData = project.members
    .map(member => {
      // Validate member data
      if (!member || typeof member !== 'object') return null;
      
      const memberUserId = member.userId;
      const memberUserName = member.userName || 'Unknown';
      
      if (!memberUserId) return null;

      // Calculate task counts with proper validation
      let assignedSubTasks = 0;
      let completedSubTasks = 0;
      let inProgressSubTasks = 0;

      try {
        assignedSubTasks = tasks.reduce((total, task) => {
          if (!task?.subTasks || !Array.isArray(task.subTasks)) return total;
          return total + task.subTasks.filter(st => 
            st && typeof st === 'object' && st.assignedId === memberUserId
          ).length;
        }, 0);

        completedSubTasks = tasks.reduce((total, task) => {
          if (!task?.subTasks || !Array.isArray(task.subTasks)) return total;
          return total + task.subTasks.filter(st => 
            st && typeof st === 'object' && 
            st.assignedId === memberUserId && 
            st.status === 'completed'
          ).length;
        }, 0);

        inProgressSubTasks = tasks.reduce((total, task) => {
          if (!task?.subTasks || !Array.isArray(task.subTasks)) return total;
          return total + task.subTasks.filter(st => 
            st && typeof st === 'object' && 
            st.assignedId === memberUserId && 
            st.status === 'in_progress'
          ).length;
        }, 0);
      } catch {
        return null;
      }

      const pendingSubTasks = Math.max(0, assignedSubTasks - completedSubTasks - inProgressSubTasks);
      const completionRate = assignedSubTasks > 0 ? Math.round((completedSubTasks / assignedSubTasks) * 100) : 0;

      return {
        name: String(memberUserName), // Ensure string
        total: Number(assignedSubTasks) || 0, // Ensure number
        completed: Number(completedSubTasks) || 0,
        inProgress: Number(inProgressSubTasks) || 0,
        pending: Number(pendingSubTasks) || 0,
        completionRate: Number(completionRate) || 0
      };
    })
    .filter(member => member !== null && member.total > 0); // Filter out null and empty members

  // Sort by total workload (descending) for better visual hierarchy
  workloadData.sort((a, b) => (b?.total || 0) - (a?.total || 0));

  if (workloadData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <div className="w-12 h-3 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">No task assignments yet</p>
        </div>
      </div>
    );
  }

  // Prepare data for Chart.js
  const labels = workloadData.map(member => member?.name || 'Unknown');
  const completedData = workloadData.map(member => member?.completed || 0);
  const inProgressData = workloadData.map(member => member?.inProgress || 0);
  const pendingData = workloadData.map(member => member?.pending || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Completed',
        data: completedData,
        backgroundColor: '#059669',
        borderColor: '#047857',
        borderWidth: 1,
      },
      {
        label: 'In Progress',
        data: inProgressData,
        backgroundColor: '#D97706',
        borderColor: '#B45309',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: pendingData,
        backgroundColor: '#DC2626',
        borderColor: '#B91C1C',
        borderWidth: 1,
      },
    ],
  };

  const height = size === 'small' ? 140 : 240;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Makes it horizontal
    plugins: {
      legend: {
        display: size === 'large',
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 11,
            weight: 'bold',
          },
          padding: 16,
          usePointStyle: true,
        },
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
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.x;
            return `${datasetLabel}: ${value} tasks`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: size === 'large',
          text: 'Number of Tasks',
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 11,
            weight: 'bold',
          },
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: size === 'small' ? 10 : 11,
          },
          stepSize: 1,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: size === 'small' ? 10 : 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  // Calculate team statistics safely
  const totalAssignedTasks = workloadData.reduce((sum, member) => sum + (member?.total || 0), 0);
  const totalCompletedTasks = workloadData.reduce((sum, member) => sum + (member?.completed || 0), 0);
  const averageWorkload = workloadData.length > 0 ? Math.round(totalAssignedTasks / workloadData.length) : 0;
  const teamCompletionRate = totalAssignedTasks > 0 ? Math.round((totalCompletedTasks / totalAssignedTasks) * 100) : 0;

  // Find member with highest and lowest workload safely
  const heaviestLoad = workloadData[0] || null;
  const lightestLoad = workloadData[workloadData.length - 1] || null;

  return (
    <div className="h-full">
      <div style={{ height: `${height}px` }}>
        <Bar data={data} options={options} />
      </div>

      {/* Workload Summary for small size */}
      {size === 'small' && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">{averageWorkload}</div>
            <div className="text-gray-600 dark:text-gray-300">Avg Load</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">{teamCompletionRate}%</div>
            <div className="text-gray-600 dark:text-gray-300">Team Rate</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">{workloadData.length}</div>
            <div className="text-gray-600 dark:text-gray-300">Active</div>
          </div>
        </div>
      )}

      {/* Detailed Analysis for large size */}
      {size === 'large' && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Team Workload Analysis</h5>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">Average Load</div>
              <div className="font-semibold text-gray-900 dark:text-white">{averageWorkload} tasks</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">Team Completion</div>
              <div className="font-semibold text-gray-900 dark:text-white">{teamCompletionRate}%</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">Most Loaded</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {heaviestLoad ? `${heaviestLoad.name} (${heaviestLoad.total})` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">Least Loaded</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {lightestLoad ? `${lightestLoad.name} (${lightestLoad.total})` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Workload Balance Analysis */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {heaviestLoad && lightestLoad && heaviestLoad.total > lightestLoad.total * 2 ? (
                <span className="text-amber-700">⚠️ Workload imbalance detected</span>
              ) : (
                <span className="text-green-700">✓ Workload is well balanced</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 