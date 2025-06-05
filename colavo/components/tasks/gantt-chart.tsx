"use client";

import React from 'react';
import { Chart } from 'react-google-charts';

// Database schema types for tasks
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
}

export function GanttChart({ tasks }: GanttChartProps) {
  // Transform tasks to Google Charts Gantt format
  const transformTasksToGanttFormat = (tasks: Task[]) => {
    const header = [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ];
    
    const rows = tasks.map(task => {
      // Use creation date as start date (could be enhanced with actual start date field)
      const startDate = new Date(task.createdAt);
      
      // Use deadline or calculate end date based on start date
      const endDate = task.deadline ? new Date(task.deadline) : new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Add 7 days if no deadline
      
      // Calculate percent complete based on subtask completion
      let percentComplete = 0;
      if (task.subTasks && task.subTasks.length > 0) {
        const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
        percentComplete = Math.round((completedSubTasks / task.subTasks.length) * 100);
      }
      
      // Get assigned users from subtasks
      const assignedUsers = task.subTasks
        ?.filter(st => st.assignedUserName)
        .map(st => st.assignedUserName)
        .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
        .join(', ') || 'Unassigned';
      
      return [
        task.id,
        task.title,
        assignedUsers,
        startDate,
        endDate,
        null,  // Duration (calculated automatically)
        percentComplete,
        null // Dependencies (could be enhanced with actual dependency tracking)
      ];
    });
    
    return [header, ...rows];
  };

  const chartData = transformTasksToGanttFormat(tasks);
  
  // If no tasks, show a message
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tasks Available</h3>
        <p className="text-gray-500 dark:text-gray-400">Create tasks in this project to view them in the Gantt chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Timeline</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gantt chart view of project tasks and progress</p>
      </div>
      <Chart
        width="100%"
        height="400px"
        chartType="Gantt"
        loader={
          <div className="p-8 text-center">
            <div className="relative animate-in fade-in duration-500 mb-4">
              {/* Multi-layer spinner */}
              <div className="w-8 h-8 mx-auto relative">
                <div className="absolute inset-0 w-8 h-8 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="absolute inset-0 w-8 h-8 mx-auto bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Loading Chart...</p>
            <div className="flex justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        }
        data={chartData}
        options={{
          height: 400,
          gantt: {
            trackHeight: 30,
            barCornerRadius: 4,
            shadowEnabled: true,
            innerGridHorizLine: {
              stroke: '#e0e0e0',
              strokeWidth: 1
            },
            innerGridTrack: { fill: '#f9f9f9' },
            innerGridDarkTrack: { fill: '#f5f5f5' },
            labelStyle: {
              fontName: 'Inter',
              fontSize: 12,
              color: '#374151'
            }
          },
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
}
