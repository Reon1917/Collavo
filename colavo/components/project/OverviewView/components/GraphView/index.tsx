"use client";

import { useState } from 'react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompletionDonutChart } from './charts/CompletionDonutChart';
import { ImportancePieChart } from './charts/ImportancePieChart';
import { WorkloadBarChart } from './charts/WorkloadBarChart';

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
}

interface Project {
  members: Array<{
    userId: string;
    userName: string;
  }>;
}

interface GraphViewProps {
  project?: Project;
  tasks?: Task[];
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function ChartCard({ title, subtitle, className = "", children, icon }: ChartCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <div className="text-[#008080] dark:text-[#00FFFF]">{icon}</div>}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <div className="h-full">
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
  trend?: 'up' | 'down' | 'stable';
}

function StatCard({ label, value, color, trend }: StatCardProps) {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
  };

  return (
    <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}

export function GraphView({ project, tasks = [] }: GraphViewProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [selectedChart, setSelectedChart] = useState<'completion' | 'importance' | 'workload'>('completion');

  // Calculate stats for stats cards
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

  const completionRate = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;
  const onTrackPercentage = totalSubTasks > 0 ? Math.round(((completedSubTasks + inProgressSubTasks) / totalSubTasks) * 100) : 0;
  const inProgressPercentage = totalSubTasks > 0 ? Math.round((inProgressSubTasks / totalSubTasks) * 100) : 0;
  const pendingPercentage = totalSubTasks > 0 ? Math.round((pendingSubTasks / totalSubTasks) * 100) : 0;

  const getChartTitle = (chart: string) => {
    switch (chart) {
      case 'completion': return 'Task Completion Progress';
      case 'importance': return 'Task Priority Distribution';
      case 'workload': return 'Team Workload Analysis';
      default: return 'Project Analytics';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900/20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full">
              <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              No Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Create tasks in this project to view analytics and progress charts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'overview'
                ? 'bg-[#008080] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'detailed'
                ? 'bg-[#008080] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Detailed
          </button>
        </div>

        {/* Chart Selector for Detailed View */}
        {viewMode === 'detailed' && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Chart:</span>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as 'completion' | 'importance' | 'workload')}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
            >
              <option value="completion">Task Completion Progress</option>
              <option value="importance">Task Priority Distribution</option>
              <option value="workload">Team Workload Distribution</option>
            </select>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className={`transition-all duration-300 ${
        viewMode === 'overview' 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
          : 'max-w-4xl mx-auto'
      }`}>
        {/* Overview Mode - Show all charts in grid */}
        {viewMode === 'overview' && (
          <>
            {/* Task Completion Progress */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Completion Progress</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Overall project completion status</p>
              <CompletionDonutChart tasks={tasks} size="small" />
            </div>

            {/* Task Priority Distribution */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Priority Distribution</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Breakdown by importance level</p>
              <ImportancePieChart tasks={tasks} size="small" />
            </div>

            {/* Team Workload Distribution */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-purple-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Workload Distribution</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Tasks assigned per team member</p>
              <WorkloadBarChart project={project} tasks={tasks} size="small" />
            </div>
          </>
        )}

        {/* Detailed Mode - Show single selected chart */}
        {viewMode === 'detailed' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            {selectedChart === 'completion' && (
              <>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="text-green-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Task Completion Progress</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Overall project completion status with detailed breakdown</p>
                <CompletionDonutChart tasks={tasks} size="large" />
              </>
            )}

            {selectedChart === 'importance' && (
              <>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="text-blue-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Task Priority Distribution</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Priority breakdown with risk assessment and detailed analysis</p>
                <ImportancePieChart tasks={tasks} size="large" />
              </>
            )}

            {selectedChart === 'workload' && (
              <>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="text-purple-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team Workload Distribution</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Comprehensive workload analysis with team performance insights</p>
                <WorkloadBarChart project={project} tasks={tasks} size="large" />
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">On Track</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{onTrackPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inProgressPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingPercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 