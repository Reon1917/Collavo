import { useState, useMemo } from 'react';

interface ProjectFile {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  size?: number | null;
  mimeType?: string | null;
  uploadThingId?: string | null;
  addedAt: string;
  addedByName: string;
  addedByEmail: string;
}

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  permissions: string[];
}

export interface UseFilesFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterByUser: string;
  setFilterByUser: (user: string) => void;
  filteredFiles: ProjectFile[];
  filteredLinks: ProjectFile[];
  availableUsers: Array<{ name: string; email: string }>;
}

export function useFilesFilters(allItems: ProjectFile[], projectMembers: ProjectMember[]): UseFilesFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByUser, setFilterByUser] = useState<string>('all');

  // Get all project members as available users (not just those who uploaded)
  const availableUsers = useMemo(() => {
    return projectMembers
      .map(member => ({
        name: member.userName,
        email: member.userEmail
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projectMembers]);

  // Apply filters
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Search filter
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // User filter
      const matchesUser = filterByUser === 'all' || 
        `${item.addedByName} (${item.addedByEmail})` === filterByUser;

      return matchesSearch && matchesUser;
    });
  }, [allItems, searchQuery, filterByUser]);

  // Separate filtered files and links
  const filteredFiles = useMemo(() => {
    return filteredItems.filter(item => item.uploadThingId !== null);
  }, [filteredItems]);

  const filteredLinks = useMemo(() => {
    return filteredItems.filter(item => item.uploadThingId === null);
  }, [filteredItems]);

  return {
    searchQuery,
    setSearchQuery,
    filterByUser,
    setFilterByUser,
    filteredFiles,
    filteredLinks,
    availableUsers,
  };
} 