import { useState, useMemo } from 'react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  creatorEmail: string;
  subTasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  note: string | null;
  deadline: string | null;
  assignedId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
}

interface UseTaskFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterImportance: string;
  setFilterImportance: (importance: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filteredTasks: Task[];
}

function getTaskProgress(task: Task): number {
  if (task.subTasks.length === 0) return 0;
  const completedCount = task.subTasks.filter(st => st.status === 'completed').length;
  return (completedCount / task.subTasks.length) * 100;
}

function getTaskStatus(task: Task): string {
  const totalSubTasks = task.subTasks.length;
  if (totalSubTasks === 0) return 'no_subtasks';
  
  const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
  const inProgressSubTasks = task.subTasks.filter(st => st.status === 'in_progress').length;
  
  if (completedSubTasks === totalSubTasks) return 'completed';
  if (inProgressSubTasks > 0 || completedSubTasks > 0) return 'in_progress';
  return 'pending';
}

export function useTaskFilters(tasks: Task[]): UseTaskFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImportance, setFilterImportance] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        task.creatorName.toLowerCase().includes(query) ||
        task.subTasks.some(subtask =>
          subtask.title.toLowerCase().includes(query) ||
          (subtask.description && subtask.description.toLowerCase().includes(query))
        )
      );
    }

    // Importance filter
    if (filterImportance !== 'all') {
      filtered = filtered.filter(task => task.importanceLevel === filterImportance);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => {
        const taskStatus = getTaskStatus(task);
        return taskStatus === filterStatus;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'importance':
          const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return importanceOrder[b.importanceLevel] - importanceOrder[a.importanceLevel];
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'progress':
          return getTaskProgress(b) - getTaskProgress(a);
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [tasks, searchQuery, filterImportance, filterStatus, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    filterImportance,
    setFilterImportance,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    filteredTasks,
  };
} 