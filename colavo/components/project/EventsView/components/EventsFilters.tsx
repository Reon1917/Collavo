import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';

interface EventsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterTimeframe: 'all' | 'upcoming' | 'past' | 'today';
  setFilterTimeframe: (timeframe: 'all' | 'upcoming' | 'past' | 'today') => void;
  sortBy: 'datetime' | 'title' | 'created';
  setSortBy: (sort: 'datetime' | 'title' | 'created') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export function EventsFilters({
  searchQuery,
  setSearchQuery,
  filterTimeframe,
  setFilterTimeframe,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: EventsFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="past">Past Events</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="datetime">Event Date</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="created">Created Date</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="flex items-center gap-2"
      >
        <ArrowUpDown className="h-4 w-4" />
        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      </Button>
    </div>
  );
} 