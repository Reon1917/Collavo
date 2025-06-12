"use client";

interface Task {
  id: string;
  createdAt?: string;
  subTasks: Array<{
    id: string;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt?: string;
    updatedAt?: string;
  }>;
}

interface ActivityHeatmapChartProps {
  tasks: Task[];
  size: 'small' | 'large';
}

export function ActivityHeatmapChart({ tasks, size }: ActivityHeatmapChartProps) {
  const now = new Date();
  const daysToShow = size === 'small' ? 14 : 30;
  
  // Generate activity data for the last N days
  const activityData = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Count activities for this date
    let taskCreated = 0;
    let taskCompleted = 0;
    
    tasks.forEach(task => {
      // Count main task creation
      if (task.createdAt && task.createdAt.startsWith(dateStr)) {
        taskCreated++;
      }
      
      // Count subtask activities
      task.subTasks.forEach(subTask => {
        if (subTask.createdAt && subTask.createdAt.startsWith(dateStr)) {
          taskCreated++;
        }
        if (subTask.status === 'completed' && subTask.updatedAt && subTask.updatedAt.startsWith(dateStr)) {
          taskCompleted++;
        }
      });
    });
    
    const totalActivity = taskCreated + taskCompleted;
    activityData.push({
      date,
      dateStr,
      taskCreated,
      taskCompleted,
      totalActivity,
      intensity: Math.min(totalActivity / 5, 1) // Normalize to 0-1
    });
  }

  const maxActivity = Math.max(...activityData.map(d => d.totalActivity));
  
  if (maxActivity === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <div className="w-8 h-8 mx-auto grid grid-cols-4 gap-0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">No recent activity</p>
        </div>
      </div>
    );
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity <= 0.25) return 'bg-green-200 dark:bg-green-900/30';
    if (intensity <= 0.5) return 'bg-green-300 dark:bg-green-700/50';
    if (intensity <= 0.75) return 'bg-green-400 dark:bg-green-600/70';
    return 'bg-green-500 dark:bg-green-500';
  };

  const gridCols = size === 'small' ? 'grid-cols-7' : 'grid-cols-10';
  const cellSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="h-full flex flex-col">
      {/* Heatmap Grid */}
      <div className={`grid ${gridCols} gap-1 mb-3`}>
        {activityData.map((day, index) => (
          <div
            key={index}
            className={`${cellSize} ${getIntensityColor(day.intensity)} rounded-sm relative group cursor-default`}
            title={`${day.date.toLocaleDateString()}: ${day.totalActivity} activities`}
          >
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {day.date.toLocaleDateString()}<br/>
              {day.taskCreated} created, {day.taskCompleted} completed
            </div>
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-200 dark:bg-green-900/30 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-300 dark:bg-green-700/50 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-400 dark:bg-green-600/70 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-500 dark:bg-green-500 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>

      {/* Stats for small size */}
      {size === 'small' && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {activityData.reduce((sum, day) => sum + day.taskCreated, 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Created</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {activityData.reduce((sum, day) => sum + day.taskCompleted, 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Completed</div>
          </div>
        </div>
      )}
    </div>
  );
} 