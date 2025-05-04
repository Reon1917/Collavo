"use client";

import { useEffect, useState } from 'react';
import { Task, User } from '@/types';
import { Button } from '@/components/ui/button';
import { getLocalTasksByProjectId, initializeLocalStorage, deleteLocalTask } from '@/lib/client-data';
import { TaskDialog } from '@/components/tasks/task-dialog';
import { TaskItem } from '@/components/tasks/task-item';
import { CalendarTaskItem } from '@/components/tasks/calendar-task-item';
import { getProjectById, getUserById, getTasksByProjectId } from '@/lib/data';
import React from 'react';

export default function TasksPage({ params }: { params: { id: string } }) {
  // Store the ID directly in a state variable to avoid the params warning
  const [projectId] = useState(() => params.id);
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  // Add a refresh trigger to force re-renders when tasks change
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get the current month and year for the calendar
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Generate calendar days for the current month
  const calendarDays = generateCalendarDays(currentMonth, currentYear);

  // Function to refresh tasks
  const refreshTasks = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    deleteLocalTask(taskId);
    refreshTasks();
  };

  // Handle task addition - just trigger a refresh since the task is added in the dialog
  const handleAddTask = () => {
    refreshTasks();
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Initialize local storage if needed
        initializeLocalStorage();
        
        // Fetch project data
        const projectData = await getProjectById(projectId);
        setProject(projectData);
        
        // Fetch tasks from local storage
        const localTasks = getLocalTasksByProjectId(projectId);
        
        // Combine with mock tasks from the data file
        const mockTasks = await getTasksByProjectId(projectId);
        
        // Merge tasks, with local tasks taking precedence
        const combinedTasks = [...mockTasks, ...localTasks];
        
        // Remove duplicates (if any task has the same ID)
        const uniqueTasks = combinedTasks.filter((task, index, self) => 
          index === self.findIndex(t => t.id === task.id)
        );
        
        setTasks(uniqueTasks);
        
        // Fetch users for assigned tasks
        // Get all unique user IDs from all tasks (which now have arrays of assignees)
        const userIds = new Set<string>();
        uniqueTasks.forEach(task => {
          // Handle both string and string[] for backward compatibility
          const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
          assignees.forEach(userId => userIds.add(userId));
        });
        
        const userPromises = Array.from(userIds).map(id => getUserById(id));
        const userResults = await Promise.all(userPromises);
        
        const userMap: Record<string, User> = {};
        userResults.forEach(user => {
          if (user) {
            userMap[user.id] = user;
          }
        });
        
        setUsers(userMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, refreshTrigger]); // Add refreshTrigger to dependencies

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Group tasks by their deadline date for the calendar view
  const tasksByDate = groupTasksByDate(tasks);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!project) {
    return <div className="text-red-500">Project not found</div>;
  }

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-gray-600">
            {tasks.length} tasks, {tasks.filter(t => t.status === 'completed').length} completed
          </p>
        </div>
        <TaskDialog projectId={projectId} onTaskAdded={handleAddTask} />
      </header>

      {/* Calendar View */}
      <section className="mb-10">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                Next
              </Button>
            </div>
          </div>
          
          {/* Calendar grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center font-medium text-sm text-gray-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dateString = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                const dayTasks = dateString ? (tasksByDate[dateString] || []) : [];
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[100px] p-2 border rounded-md ${!day ? 'bg-gray-50' : isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    {day ? (
                      <>
                        <div className={`text-right text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayTasks.slice(0, 3).map(task => (
                            <CalendarTaskItem key={task.id} task={task} />
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Task List */}
      <section>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.length > 0 ? (
              tasks.map(task => {
                // Get assignees for this task
                const taskAssignees = Array.isArray(task.assignedTo) 
                  ? task.assignedTo.map(id => users[id]).filter(Boolean)
                  : users[task.assignedTo] ? [users[task.assignedTo]] : [];
                
                return (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    projectId={projectId} 
                    assignees={taskAssignees}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                No tasks added yet
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper function to group tasks by their deadline date
function groupTasksByDate(tasks: Task[]) {
  return tasks.reduce((acc, task) => {
    const date = new Date(task.deadline).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}

// Helper function to generate calendar days for a given month
function generateCalendarDays(month: number, year: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Create array with empty slots for days from previous month
  const days = Array(firstDay).fill(null);
  
  // Add the days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
}
