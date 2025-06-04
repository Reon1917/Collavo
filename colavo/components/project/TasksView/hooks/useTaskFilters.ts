import { useState, useMemo } from 'react';
import { Task, getTaskProgress } from '../types';

export function useTaskFilters(tasks: Task[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImportance, setFilterImportance] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesImportance = filterImportance === 'all' || task.importanceLevel === filterImportance;
        
        let matchesStatus = true;
        if (filterStatus === 'completed') {
          matchesStatus = task.subTasks.length > 0 && task.subTasks.every(st => st.status === 'completed');
        } else if (filterStatus === 'in_progress') {
          matchesStatus = task.subTasks.some(st => st.status === 'in_progress');
        } else if (filterStatus === 'pending') {
          matchesStatus = task.subTasks.length === 0 || task.subTasks.some(st => st.status === 'pending');
        }

        return matchesSearch && matchesImportance && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'deadline':
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          case 'importance':
            const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return importanceOrder[b.importanceLevel] - importanceOrder[a.importanceLevel];
          case 'progress':
            return getTaskProgress(b) - getTaskProgress(a);
          default: // created
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
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
    filteredAndSortedTasks,
  };
} 