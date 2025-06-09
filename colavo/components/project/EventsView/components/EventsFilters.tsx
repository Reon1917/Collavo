import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, Clock, SortAsc, ArrowUpDown } from 'lucide-react';

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
  const timeFrameLabels = {
    all: 'All Events',
    today: 'Today',
    upcoming: 'Upcoming',
    past: 'Past Events',
  };

  const sortLabels = {
    datetime: 'Event Date',
    title: 'Title A-Z',
    created: 'Recently Created',
  };

  const getTimeFrameIcon = (frame: string) => {
    switch (frame) {
      case 'today': return <Clock className="w-3 h-3" />;
      case 'upcoming': return <Calendar className="w-3 h-3" />;
      case 'past': return <Calendar className="w-3 h-3" />;
      default: return <Filter className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search - More prominent */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search events by title, description, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]"
        />
      </div>

      {/* Enhanced Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left Side - Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Time Frame Filter with Icons */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:block">Filter:</span>
            <Select value={filterTimeframe} onValueChange={(value) => setFilterTimeframe(value as 'all' | 'upcoming' | 'past' | 'today')}>
              <SelectTrigger className="w-[140px] h-9 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]">
                <div className="flex items-center gap-2">
                  {getTimeFrameIcon(filterTimeframe)}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(timeFrameLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {getTimeFrameIcon(value)}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Badge */}
          {filterTimeframe !== 'all' && (
            <Badge 
              variant="secondary" 
              className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800"
            >
              {timeFrameLabels[filterTimeframe]}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-teal-200 dark:hover:bg-teal-800"
                onClick={() => setFilterTimeframe('all')}
              >
                ×
              </Button>
            </Badge>
          )}
        </div>

        {/* Right Side - Sort */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:block">Sort:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'datetime' | 'title' | 'created')}>
              <SelectTrigger className="w-[140px] h-9 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-9 px-3 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:border-[#008080] dark:hover:border-[#00FFFF]"
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
          </Button>
        </div>
      </div>

      {/* Search active indicator */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
            Searching: &quot;{searchQuery}&quot;
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-blue-200 dark:hover:bg-blue-800"
              onClick={() => setSearchQuery('')}
            >
              ×
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
} 