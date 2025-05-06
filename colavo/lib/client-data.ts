import { Task, TaskImportance, TaskStatus, Event } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const TASKS_STORAGE_KEY = 'colavo-tasks';
const EVENTS_STORAGE_KEY = 'colavo-events';

// Mock event data
const mockEvents = [
  {
    id: 'event1',
    projectId: 'project1',
    title: 'Marketing Strategy Meeting',
    description: 'Weekly team meeting to discuss marketing strategy and progress',
    date: '2025-05-15T00:00:00.000Z',
    time: '10:00',
    location: 'Conference Room A',
    createdAt: '2025-05-01T00:00:00.000Z',
    type: 'event'
  },
  {
    id: 'event2',
    projectId: 'project1',
    title: 'Presentation Rehearsal',
    description: 'Final rehearsal for the marketing presentation',
    date: '2025-05-18T00:00:00.000Z',
    time: '14:00',
    location: 'Main Hall',
    createdAt: '2025-05-01T00:00:00.000Z',
    type: 'event'
  },
  {
    id: 'event3',
    projectId: 'project2',
    title: 'Lab Data Analysis Session',
    description: 'Group session to analyze and discuss lab results',
    date: '2025-05-16T00:00:00.000Z',
    time: '13:00',
    location: 'Physics Lab',
    createdAt: '2025-05-01T00:00:00.000Z',
    type: 'event'
  },
  {
    id: 'event4',
    projectId: 'project2',
    title: 'Report Writing Workshop',
    description: 'Workshop on scientific writing and data presentation',
    date: '2025-05-19T00:00:00.000Z',
    time: '15:00',
    location: 'Library Study Room',
    createdAt: '2025-05-01T00:00:00.000Z',
    type: 'event'
  },
  {
    id: 'event5',
    projectId: 'project3',
    title: 'Historical Research Discussion',
    description: 'Group discussion on primary sources and research findings',
    date: '2025-05-17T00:00:00.000Z',
    time: '11:00',
    location: 'History Department',
    createdAt: '2025-05-01T00:00:00.000Z',
    type: 'event'
  },
  {
    id: 'event6',
    projectId: 'project3',
    title: 'Essay Draft Review',
    description: 'Peer review session for essay drafts',
    date: '2025-05-20T00:00:00.000Z',
    time: '16:00',
    location: 'Study Center',
    createdAt: '2025-05-01T00:00:00.000Z',
    type: 'event'
  },
  {
    id: 'event7',
    projectId: 'project4',
    title: 'Study Group Session',
    description: 'Group study session for finals preparation',
    date: '2025-05-21T00:00:00.000Z',
    time: '09:00',
    location: 'Student Center',
    createdAt: '2025-05-01T00:00:00.000Z',
    type: 'event'
  }
];

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
    // Initialize with mock events
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mockEvents));
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
