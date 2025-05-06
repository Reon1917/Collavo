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
import { GanttChart } from '@/components/tasks/gantt-chart';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  // Changed view type to include 'gantt'
  const [view, setView] = useState<'list' | 'calendar' | 'gantt'>('list');

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
    let filtered = [...tasks];
    
    if (filters.assignee) {
      filtered = filtered.filter(task => {
        if (Array.isArray(task.assignedTo)) {
          return task.assignedTo.includes(filters.assignee!);
        }
        return task.assignedTo === filters.assignee;
      });
    }
    
    if (filters.importance) {
      filtered = filtered.filter(task => task.importance === filters.importance);
    }
    
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    // Then apply sorting
    return filtered.sort((a, b) => {
      const field = sortOptions.field;
      const direction = sortOptions.direction === 'asc' ? 1 : -1;
      
      if (field === 'deadline') {
        // Handle null deadlines
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return direction;
        if (!b.deadline) return -direction;
        
        return direction * (new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      }
      
      if (field === 'importance') {
        const importanceOrder = { low: 1, medium: 2, high: 3 };
        const aValue = importanceOrder[a.importance as keyof typeof importanceOrder] || 0;
        const bValue = importanceOrder[b.importance as keyof typeof importanceOrder] || 0;
        
        return direction * (aValue - bValue);
      }
      
      if (field === 'title') {
        return direction * a.title.localeCompare(b.title);
      }
      
      return 0;
    });
  }, [tasks, filters, sortOptions]);

  // Create a list of users for the filters dropdown
  const usersList = useMemo(() => {
    return Object.values(users);
  }, [users]);

  // Calendar view helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });
  
  // Create calendar days array
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        date: new Date(currentYear, currentMonth, i)
      });
    }
    
    return days;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfMonth]);
  
  // Group tasks by date for the calendar view
  const tasksByDate = useMemo(() => {
    const taskMap: Record<string, Task[]> = {};
    
    filteredAndSortedTasks.forEach(task => {
      if (task.deadline) {
        const date = new Date(task.deadline);
        const dateString = date.toDateString();
        
        if (!taskMap[dateString]) {
          taskMap[dateString] = [];
        }
        
        taskMap[dateString].push(task);
      }
    });
    
    return taskMap;
  }, [filteredAndSortedTasks]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get the current view label for the dropdown
  const viewLabel = {
    list: 'List View',
    calendar: 'Calendar View',
    gantt: 'Gantt Chart'
  }[view];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project?.name} Tasks</h1>
        <div className="flex space-x-2">
          {/* Replace buttons with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {viewLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setView('list')} className="flex items-center justify-between">
                List View
                {view === 'list' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('calendar')} className="flex items-center justify-between">
                Calendar View
                {view === 'calendar' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('gantt')} className="flex items-center justify-between">
                Gantt Chart
                {view === 'gantt' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      
      {view === 'list' && (
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
      )}
      
      {view === 'calendar' && (
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

      {/* Add Gantt Chart View */}
      {view === 'gantt' && (
        <GanttChart tasks={filteredAndSortedTasks} />
      )}
    </div>
  );
}
