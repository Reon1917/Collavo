"use client";

import { useEffect, useState, useMemo } from 'react';
import { Task, User } from '@/types';
import { Button } from '@/components/ui/button';
import { getLocalTasksByProjectId, initializeLocalStorage, deleteLocalTask } from '@/lib/client-data';
import { TaskDialog } from '@/components/tasks/task-dialog';
import { TaskItem } from '@/components/tasks/task-item';
import { CalendarTaskItem } from '@/components/tasks/calendar-task-item';
import { TaskFilters, TaskFilters as TaskFiltersType, SortOptions } from '@/components/tasks/task-filters';
import { getProjectById, getUserById, getTasksByProjectId, getCurrentUser } from '@/lib/data';
import React from 'react';

export default function TasksPage({ params }: { params: { id: string } }) {
  // Store the ID directly in a state variable to avoid the params warning
  const [projectId] = useState(() => params.id);
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectLeader, setIsProjectLeader] = useState(false);
  // Add a refresh trigger to force re-renders when tasks change
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get the current month and year for the calendar
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [view, setView] = useState<'list' | 'calendar'>('list');

  // Add filter and sort state
  const [filters, setFilters] = useState<TaskFiltersType>({
    assignee: null,
    importance: null,
    status: null
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'deadline',
    direction: 'asc'
  });

  // Function to handle filter changes
  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  // Function to handle sort changes
  const handleSortChange = (newSortOptions: SortOptions) => {
    setSortOptions(newSortOptions);
  };

  // Fetch project data and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Initialize local storage if needed
        initializeLocalStorage();
        
        // Fetch project data
        const projectData = await getProjectById(projectId);
        if (!projectData) {
          console.error('Project not found');
          return;
        }
        setProject(projectData);
        
        // Check if current user is the project leader
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          console.error('Current user not found');
          return;
        }
        setIsProjectLeader(projectData.leader === currentUser.id);
        
        // Fetch tasks
        const tasksData = await getTasksByProjectId(projectId);
        const localTasks = getLocalTasksByProjectId(projectId);
        
        // Combine server and local tasks (in a real app, these would be the same source)
        const allTasks = [...tasksData, ...localTasks];
        setTasks(allTasks);
        
        // Fetch user data for all assignees
        const userMap: Record<string, User> = {};
        const userPromises = allTasks.flatMap(task => {
          // Handle both string and string[] for backward compatibility
          const assigneeIds = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
          return assigneeIds.map(async (userId) => {
            if (userId && !userMap[userId]) {
              try {
                const userData = await getUserById(userId);
                userMap[userId] = userData;
              } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
              }
            }
          });
        });
        
        await Promise.all(userPromises.filter(Boolean));
        setUsers(userMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, refreshTrigger]);

  // Function to refresh tasks
  const refreshTasks = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Function to handle task deletion
  const handleTaskDelete = (taskId: string) => {
    deleteLocalTask(taskId);
    refreshTasks();
  };

  // Apply filters and sorting to tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First apply filters
    let result = [...tasks];
    
    if (filters.assignee) {
      result = result.filter(task => {
        const assigneeIds = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
        return assigneeIds.includes(filters.assignee!);
      });
    }
    
    if (filters.importance) {
      result = result.filter(task => task.importance === filters.importance);
    }
    
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }
    
    // Then apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOptions.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'importance': {
          const importanceOrder = { minor: 0, normal: 1, major: 2, critical: 3 };
          comparison = importanceOrder[a.importance] - importanceOrder[b.importance];
          break;
        }
        case 'status': {
          const statusOrder = { pending: 0, 'in-progress': 1, completed: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
      }
      
      // Apply sort direction
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [tasks, filters, sortOptions]);

  // Get all users as an array for the filters component
  const usersList = useMemo(() => {
    return Object.values(users);
  }, [users]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Create array for days in month
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ day, date });
    }
    
    return days;
  }, [currentMonth, currentYear]);

  // Group tasks by date for calendar view
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    filteredAndSortedTasks.forEach(task => {
      const date = new Date(task.deadline).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    
    return grouped;
  }, [filteredAndSortedTasks]);

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

  // Get month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project?.name} Tasks</h1>
        <div className="flex space-x-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <Button 
              variant={view === 'list' ? 'default' : 'outline'}
              className={view === 'list' ? 'rounded-none bg-blue-600' : 'rounded-none'}
              onClick={() => setView('list')}
            >
              List
            </Button>
            <Button 
              variant={view === 'calendar' ? 'default' : 'outline'}
              className={view === 'calendar' ? 'rounded-none bg-blue-600' : 'rounded-none'}
              onClick={() => setView('calendar')}
            >
              Calendar
            </Button>
          </div>
          {isProjectLeader && (
            <TaskDialog 
              projectId={projectId} 
              onTaskAdded={refreshTasks}
            />
          )}
        </div>
      </div>

      {/* Filters and Sort Component */}
      <TaskFilters 
        users={usersList}
        filters={filters}
        sortOptions={sortOptions}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
      />
      
      {view === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredAndSortedTasks.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedTasks.map(task => {
                // Get assignee data for each task
                const assigneeData = Array.isArray(task.assignedTo)
                  ? task.assignedTo.map(id => users[id]).filter(Boolean)
                  : users[task.assignedTo] ? [users[task.assignedTo]] : [];
                
                return (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    projectId={projectId}
                    assignees={assigneeData}
                    onDelete={() => handleTaskDelete(task.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No tasks found. Add a new task to get started!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={goToPreviousMonth}>&lt; Prev</Button>
            <h2 className="text-xl font-semibold">{monthName} {currentYear}</h2>
            <Button variant="outline" onClick={goToNextMonth}>Next &gt;</Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium py-2">{day}</div>
            ))}
            
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`min-h-[100px] border rounded-md p-1 ${day.day ? 'bg-white' : 'bg-gray-50'}`}
              >
                {day.day && (
                  <>
                    <div className="text-right text-sm font-medium mb-1">
                      {day.day}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                      {day.date && tasksByDate[day.date.toDateString()]?.map(task => (
                        <CalendarTaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
