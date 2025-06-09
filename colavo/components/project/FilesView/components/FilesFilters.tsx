import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, User, X } from 'lucide-react';

interface FilesFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterByUser: string;
  setFilterByUser: (user: string) => void;
  availableUsers: Array<{ name: string; email: string }>;
}

export function FilesFilters({
  searchQuery,
  setSearchQuery,
  filterByUser,
  setFilterByUser,
  availableUsers,
}: FilesFiltersProps) {
  const selectedUser = availableUsers.find(user => `${user.name} (${user.email})` === filterByUser);

  return (
    <div className="space-y-4">
      {/* Search - More prominent */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search files and links by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
        />
      </div>

      {/* Enhanced Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left Side - Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Added By Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:block">Filter by:</span>
            <Select value={filterByUser} onValueChange={setFilterByUser}>
              <SelectTrigger className="w-[200px] h-9 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <SelectValue placeholder="All members" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>All members</span>
                  </div>
                </SelectItem>
                {availableUsers.map((user) => {
                  const userKey = `${user.name} (${user.email})`;
                  return (
                    <SelectItem key={userKey} value={userKey}>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{user.name}</span>
                        <span className="text-xs text-gray-500">({user.email})</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Badge */}
          {filterByUser !== 'all' && selectedUser && (
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              Added by: {selectedUser.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-200 dark:hover:bg-blue-800"
                onClick={() => setFilterByUser('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>

        {/* Right Side - Stats */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span>{availableUsers.length} member{availableUsers.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Search active indicator */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
            Searching: "{searchQuery}"
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-green-200 dark:hover:bg-green-800"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
} 