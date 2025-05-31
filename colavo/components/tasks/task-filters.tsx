"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc, SortDesc, X } from "lucide-react";

// Database schema types
export type TaskImportance = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type SortField = 'title' | 'deadline' | 'importance' | 'status';
export type SortDirection = 'asc' | 'desc';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface TaskFilters {
  assignee: string | null;
  importance: TaskImportance | null;
  status: TaskStatus | null;
}

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

interface TaskFiltersProps {
  users: User[];
  filters: TaskFilters;
  sortOptions: SortOptions;
  onFiltersChange: (filters: TaskFilters) => void;
  onSortChange: (sortOptions: SortOptions) => void;
}

export function TaskFilters({ users, filters, sortOptions, onFiltersChange, onSortChange }: TaskFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Count active filters
  const activeFilterCount = [
    filters.assignee,
    filters.importance,
    filters.status
  ].filter(Boolean).length;
  
  const handleAssigneeChange = (userId: string | null) => {
    onFiltersChange({ ...filters, assignee: userId });
  };
  
  const handleImportanceChange = (importance: TaskImportance | null) => {
    onFiltersChange({ ...filters, importance });
  };
  
  const handleStatusChange = (status: TaskStatus | null) => {
    onFiltersChange({ ...filters, status });
  };
  
  const handleSortFieldChange = (field: SortField) => {
    if (sortOptions.field === field) {
      // Toggle direction if same field
      onSortChange({
        field,
        direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // New field, default to ascending
      onSortChange({ field, direction: 'asc' });
    }
  };
  
  const clearAllFilters = () => {
    onFiltersChange({
      assignee: null,
      importance: null,
      status: null
    });
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={activeFilterCount > 0 ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400" : ""}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 dark:text-gray-400 mr-1">Sort by:</div>
          {['title', 'deadline', 'importance', 'status'].map((field) => (
            <Button 
              key={field}
              variant={sortOptions.field === field ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSortFieldChange(field as SortField)}
              className={sortOptions.field === field ? "bg-blue-600 text-white dark:bg-blue-700" : "text-gray-600 dark:text-gray-400"}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {sortOptions.field === field && (
                sortOptions.direction === 'asc' ? 
                  <SortAsc className="h-3 w-3 ml-1" /> : 
                  <SortDesc className="h-3 w-3 ml-1" />
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {isFiltersOpen && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assignee Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Assignee</h4>
              <div className="space-y-1">
                <div 
                  className={`cursor-pointer px-2 py-1 rounded text-sm ${filters.assignee === null ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => handleAssigneeChange(null)}
                >
                  All Members
                </div>
                {users.map(user => (
                  <div 
                    key={user.id}
                    className={`cursor-pointer px-2 py-1 rounded text-sm ${filters.assignee === user.id ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => handleAssigneeChange(user.id)}
                  >
                    {user.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Importance Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Importance</h4>
              <div className="space-y-1">
                <div 
                  className={`cursor-pointer px-2 py-1 rounded text-sm ${filters.importance === null ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => handleImportanceChange(null)}
                >
                  All Levels
                </div>
                {['low', 'medium', 'high', 'critical'].map(importance => (
                  <div 
                    key={importance}
                    className={`cursor-pointer px-2 py-1 rounded text-sm ${filters.importance === importance ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => handleImportanceChange(importance as TaskImportance)}
                  >
                    {importance.charAt(0).toUpperCase() + importance.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Status</h4>
              <div className="space-y-1">
                <div 
                  className={`cursor-pointer px-2 py-1 rounded text-sm ${filters.status === null ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => handleStatusChange(null)}
                >
                  All Statuses
                </div>
                {['pending', 'in_progress', 'completed'].map(status => (
                  <div 
                    key={status}
                    className={`cursor-pointer px-2 py-1 rounded text-sm ${filters.status === status ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => handleStatusChange(status as TaskStatus)}
                  >
                    {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
