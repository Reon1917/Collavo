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
    <Card className="border-[2px] border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 [border-spacing:4px]">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-base font-medium mb-1">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
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