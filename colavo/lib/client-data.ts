import { Task, TaskImportance, TaskStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const TASKS_STORAGE_KEY = 'colavo-tasks';

// Initialize local storage with mock data if empty
export function initializeLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  // Check if tasks exist in local storage
  const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!storedTasks) {
    // Initialize with empty array
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
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
export function addLocalTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString()
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
