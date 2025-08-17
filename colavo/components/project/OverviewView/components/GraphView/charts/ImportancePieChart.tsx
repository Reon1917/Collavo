"use client";

import { Pie } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Task {
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ImportancePieChartProps {
  tasks: Task[];
  size: 'small' | 'large';
}

export function ImportancePieChart({ tasks, size }: ImportancePieChartProps) {
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

  // Calculate importance distribution
  const criticalTasks = tasks.filter(task => task.importanceLevel === 'critical').length;
  const highTasks = tasks.filter(task => task.importanceLevel === 'high').length;
  const mediumTasks = tasks.filter(task => task.importanceLevel === 'medium').length;
  const lowTasks = tasks.filter(task => task.importanceLevel === 'low').length;

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-muted-foreground dark:text-muted-foreground mb-2">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-border dark:border-border"></div>
          </div>
          <p className="text-sm text-muted-foreground">No tasks to analyze</p>
        </div>
      </div>
    );
  }

  // Only include non-zero categories for cleaner visualization
  const labels: string[] = [];
  const dataValues: number[] = [];
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];

  if (criticalTasks > 0) {
    labels.push('Critical');
    dataValues.push(criticalTasks);
    backgroundColors.push('#DC2626');
    borderColors.push('#B91C1C');
  }
  if (highTasks > 0) {
    labels.push('High');
    dataValues.push(highTasks);
    backgroundColors.push('#EA580C');
    borderColors.push('#C2410C');
  }
  if (mediumTasks > 0) {
    labels.push('Medium');
    dataValues.push(mediumTasks);
    backgroundColors.push('#2563EB');
    borderColors.push('#1D4ED8');
  }
  if (lowTasks > 0) {
    labels.push('Low');
    dataValues.push(lowTasks);
    backgroundColors.push('#059669');
    borderColors.push('#047857');
  }

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const height = size === 'small' ? 180 : 280;

  const options: ChartOptions<'pie'> = {
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
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = Math.round((value / tasks.length) * 100);
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

  // Calculate risk level
  const totalTasks = tasks.length;
  const criticalPercentage = Math.round((criticalTasks / totalTasks) * 100);
  const highPercentage = Math.round((highTasks / totalTasks) * 100);
  const riskLevel = criticalPercentage + highPercentage;

  const getRiskLevel = () => {
    if (riskLevel >= 60) return { level: 'High Risk', color: 'text-red-700', bgColor: 'bg-red-100' };
    if (riskLevel >= 30) return { level: 'Medium Risk', color: 'text-orange-700', bgColor: 'bg-orange-100' };
    return { level: 'Low Risk', color: 'text-green-700', bgColor: 'bg-green-100' };
  };

  const risk = getRiskLevel();

  return (
    <div className="h-full">
      <div style={{ height: `${height}px` }}>
        <Pie data={data} options={options} />
      </div>
      
      {/* Risk indicator and simple stats for small size */}
      {size === 'small' && (
        <div className="mt-3 space-y-2">
          {/* Risk Level Indicator */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${risk.bgColor} ${risk.color}`}>
              {risk.level}
            </div>
          </div>
          
          {/* Simple counts */}
          <div className="flex justify-center gap-4 text-xs">
            {criticalTasks > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                <span className="text-foreground">{criticalTasks}</span>
              </div>
            )}
            {highTasks > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-orange-600 rounded-full"></div>
                <span className="text-foreground">{highTasks}</span>
              </div>
            )}
            {mediumTasks > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                <span className="text-foreground">{mediumTasks}</span>
              </div>
            )}
            {lowTasks > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                <span className="text-foreground">{lowTasks}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed stats for large size */}
      {size === 'large' && (
        <div className="mt-4 bg-muted dark:bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-foreground dark:text-foreground">Priority Analysis</h5>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${risk.bgColor} ${risk.color}`}>
              {risk.level}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">High Priority Tasks</div>
              <div className="font-semibold text-foreground dark:text-foreground">
                {criticalTasks + highTasks} of {totalTasks} ({riskLevel}%)
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Most Common Priority</div>
              <div className="font-semibold text-foreground dark:text-foreground">
                {mediumTasks >= Math.max(criticalTasks, highTasks, lowTasks) ? 'Medium' :
                 highTasks >= Math.max(criticalTasks, mediumTasks, lowTasks) ? 'High' :
                 criticalTasks >= Math.max(highTasks, mediumTasks, lowTasks) ? 'Critical' : 'Low'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 