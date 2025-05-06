import { Task, TaskImportance, TaskStatus, Event } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const TASKS_STORAGE_KEY = 'colavo-tasks';
const EVENTS_STORAGE_KEY = 'colavo-events';

// Initialize local storage with mock data if empty
export function initializeLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  // Check if tasks exist in local storage
  const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!storedTasks) {
    // Initialize with empty array
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
  }

  // Check if events exist in local storage
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (!storedEvents) {
    // Initialize with empty array
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify([]));
  }
}

// Get tasks from local storage
export function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  
  const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  return storedTasks ? JSON.parse(storedTasks) : [];
}

// Get tasks by project ID from local storage
export function getLocalTasksByProjectId(projectId: string): Task[] {
  const tasks = getLocalTasks();
  return tasks.filter(task => task.projectId === projectId);
}

// Add a new task to local storage
export function addLocalTask(task: Omit<Task, 'id' | 'createdAt' | 'type'>): Task {
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    type: 'task' // Explicitly set type for tasks
  };
  
  const tasks = getLocalTasks();
  tasks.push(newTask);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  
  return newTask;
}

// Delete a task from local storage
export function deleteLocalTask(taskId: string): void {
  const tasks = getLocalTasks();
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
}

// Update a task in local storage
export function updateLocalTask(taskId: string, updates: Partial<Task>): Task | null {
  const tasks = getLocalTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) return null;
  
  const updatedTask = { ...tasks[taskIndex], ...updates };
  tasks[taskIndex] = updatedTask;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  
  return updatedTask;
}

// Get events from local storage
export function getLocalEvents(): Event[] {
  if (typeof window === 'undefined') return [];
  
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (!storedEvents) return [];
  
  // Handle migration from old format (startDate/endDate) to new format (date/time)
  const events = JSON.parse(storedEvents);
  return events.map((event: any) => {
    // If the event already has date and time properties, return it as is
    if (event.date && event.time) {
      return event;
    }
    
    // If the event has startDate but no date/time, migrate it
    if (event.startDate && !event.date) {
      const startDate = new Date(event.startDate);
      return {
        ...event,
        date: startDate.toISOString().split('T')[0],
        time: startDate.toTimeString().substring(0, 5), // Extract HH:MM
        type: 'event'
      };
    }
    
    return event;
  });
}

// Get events by project ID from local storage
export function getLocalEventsByProjectId(projectId: string): Event[] {
  const events = getLocalEvents();
  return events.filter(event => event.projectId === projectId);
}

// Add a new event to local storage
export function addLocalEvent(event: Omit<Event, 'id' | 'createdAt' | 'type'>): Event {
  const newEvent: Event = {
    ...event,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    type: 'event'
  };
  
  const events = getLocalEvents();
  events.push(newEvent);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  
  return newEvent;
}

// Delete an event from local storage
export function deleteLocalEvent(eventId: string): void {
  const events = getLocalEvents();
  const updatedEvents = events.filter(event => event.id !== eventId);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
}

// Update an event in local storage
export function updateLocalEvent(eventId: string, updates: Partial<Event>): Event | null {
  const events = getLocalEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) return null;
  
  const updatedEvent = { ...events[eventIndex], ...updates };
  events[eventIndex] = updatedEvent;
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  
  return updatedEvent;
}
