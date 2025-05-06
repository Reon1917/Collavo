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
      // Use creation date as start date if no start date is provided
      const startDate = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
      
      // Use deadline as end date
      const endDate = task.deadline ? new Date(task.deadline) : new Date(startDate);
      
      // Calculate percent complete based on status
      let percentComplete = 0;
      if (task.status === 'in-progress') percentComplete = 50;
      if (task.status === 'completed') percentComplete = 100;
      
      return [
        task.id,
        task.title,
        Array.isArray(task.assignedTo) ? 
          task.assignedTo.join(', ') : 
          (task.assignedTo || 'Unassigned'),
        startDate,
        endDate,
        null,  // Duration (calculated automatically)
        percentComplete,
        null   // Dependencies (not implemented)
      ];
    });
    
    return [header, ...rows];
  };

  const chartData = transformTasksToGanttFormat(tasks);
  
  // If no tasks, show a message
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <p className="text-gray-500">No tasks found. Add a new task to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Chart
        width="100%"
        height="400px"
        chartType="Gantt"
        loader={<div className="p-8 text-center">Loading Chart...</div>}
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
            innerGridDarkTrack: { fill: '#f5f5f5' }
          },
        }}
      />
    </div>
  );
}
