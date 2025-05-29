"use client";

import React from 'react';
import { Chart } from 'react-google-charts';
import { Task } from '@/types';

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
      // Use startDate or fallback to creation date
      const startDate = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
      
      // Use dueDate or calculate end date based on start date
      const endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + (24 * 60 * 60 * 1000)); // Add 1 day if no due date
      
      // Calculate percent complete based on status
      let percentComplete = 0;
      switch (task.status) {
        case 'backlog':
        case 'todo':
          percentComplete = 0;
          break;
        case 'in-progress':
          percentComplete = 50;
          break;
        case 'review':
          percentComplete = 75;
          break;
        case 'completed':
          percentComplete = 100;
          break;
        case 'cancelled':
          percentComplete = 0;
          break;
        default:
          percentComplete = 0;
      }
      
      // TODO: Replace with actual user names from backend
      // For now, show assigned user IDs or "Unassigned"
      const assignedResource = task.assignedTo.length > 0 
        ? task.assignedTo.join(', ') 
        : 'Unassigned';
      
      return [
        task.id,
        task.title,
        assignedResource,
        startDate,
        endDate,
        null,  // Duration (calculated automatically)
        percentComplete,
        task.dependencies.length > 0 ? task.dependencies.join(', ') : null
      ];
    });
    
    return [header, ...rows];
  };

  const chartData = transformTasksToGanttFormat(tasks);
  
  // If no tasks, show a message
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Available</h3>
        <p className="text-gray-500">Create tasks in this project to view them in the Gantt chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
        <p className="text-sm text-gray-500">Gantt chart view of project tasks and dependencies</p>
      </div>
      <Chart
        width="100%"
        height="400px"
        chartType="Gantt"
        loader={<div className="p-8 text-center text-gray-500">Loading Chart...</div>}
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
