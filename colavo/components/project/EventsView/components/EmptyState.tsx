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
    <Card className="bg-background dark:bg-card border border-border/60 dark:border-border">
      <CardContent className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground dark:text-muted-foreground mb-4">
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