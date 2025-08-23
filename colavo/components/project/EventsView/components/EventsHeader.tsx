import { Badge } from '@/components/ui/badge';
import { CreateEventForm } from './forms/CreateEventForm';
import { Project, Event } from '../types';

interface EventsHeaderProps {
  project: Project;
  canCreateEvents: boolean;
  onEventCreated: (newEvent: Event) => void;
}

export function EventsHeader({ project, canCreateEvents, onEventCreated }: EventsHeaderProps) {
  // Get user's role display
  const getUserRoleInfo = () => {
    if (project.isLeader) {
      return {
        label: 'Project Leader',
        description: 'You can see and manage all events in this project'
      };
    } else if (project.userPermissions.includes('handleEvent')) {
      return {
        label: 'Team Member (Event Access)',
        description: 'You can see and manage events in this project'
      };
    } else {
      return {
        label: 'Team Member',
        description: 'You can view events but cannot create or manage them'
      };
    }
  };

  const roleInfo = getUserRoleInfo();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
          <Badge 
            variant={project.isLeader ? "default" : "secondary"}
            className={project.isLeader 
              ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
            }
          >
            {roleInfo.label}
          </Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {roleInfo.description}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Project: {project.name}
        </p>
      </div>
      {canCreateEvents && (
        <CreateEventForm 
          projectId={project.id} 
          onEventCreated={onEventCreated}
          projectData={project}
        />
      )}
    </div>
  );
} 