import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, X } from 'lucide-react';

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
  const selectedUser = availableUsers.find(user => user.name === filterByUser);

  return (
    <div className="space-y-4">
      {/* Search - More prominent */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
        <Input
          placeholder="Search files and links by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-background dark:bg-muted border-2 border-primary/20 dark:border-primary/30 focus:border-primary dark:focus:border-primary shadow-sm"
        />
      </div>

      {/* Enhanced Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left Side - Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Added By Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground hidden sm:block">Filter by:</span>
            <Select value={filterByUser} onValueChange={setFilterByUser}>
              <SelectTrigger className="w-[200px] h-9 bg-background dark:bg-muted border-2 border-primary/20 dark:border-primary/30 focus:border-primary dark:focus:border-primary shadow-sm">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-primary" />
                  <SelectValue placeholder="All members" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-primary" />
                    <span>All members</span>
                  </div>
                </SelectItem>
                {availableUsers.map((user) => (
                  <SelectItem key={user.name} value={user.name}>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-primary" />
                      <span>{user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Badge */}
          {filterByUser !== 'all' && selectedUser && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-2 border-primary/20 dark:border-primary/30"
            >
              Added by: {selectedUser.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-primary/20"
                onClick={() => setFilterByUser('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      </div>

      {/* Search active indicator */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-2 border-primary/20 dark:border-primary/30">
            Searching: &quot;{searchQuery}&quot;
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-primary/20"
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