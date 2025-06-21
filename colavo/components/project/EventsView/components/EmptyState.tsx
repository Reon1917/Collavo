import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { CreateEventForm } from '@/components/project/EventsView/components/forms/CreateEventForm';
import { Project, Event } from '../types';

interface EmptyStateProps {
  project: Project;
  totalEvents: number;
  canCreateEvents: boolean;
  onEventCreated: (newEvent: Event) => void;
}

export function EmptyState({ project, totalEvents, canCreateEvents, onEventCreated }: EmptyStateProps) {
  const getEmptyMessage = () => {
    if (totalEvents === 0) {
      return {
        title: 'No events found',
        description: 'No events have been created for this project yet.'
      };
    } else {
      return {
        title: 'No events match your filters',
        description: 'Try adjusting your search or filter criteria to find events.'
      };
    }
  };

  const { title, description } = getEmptyMessage();

  return (
    <Card className="border-2 border-dashed border-[#008080]/30 dark:border-[#00FFFF]/30 bg-[#008080]/5 dark:bg-[#00FFFF]/5">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#008080]/10 dark:bg-[#00FFFF]/10 rounded-full flex items-center justify-center">
          <Calendar className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
        {canCreateEvents && totalEvents === 0 && (
          <CreateEventForm 
            projectId={project.id} 
            onEventCreated={onEventCreated}
            projectData={project}
          />
        )}
      </CardContent>
    </Card>
  );
} 