import { Badge } from '@/components/ui/badge';
import { CreateTaskForm } from './forms/CreateTaskForm';
import { Project, Task } from '../types';

interface TasksHeaderProps {
  project: Project;
  onTaskCreated: (newTask: Task) => void;
}

export function TasksHeader({ project, onTaskCreated }: TasksHeaderProps) {
  // Role-based permission checks
  const canCreateTasks = project.userPermissions.includes('createTask');

  // Get user's role display
  const getUserRoleInfo = () => {
    if (project.isLeader) {
      return {
        label: 'Project Leader',
        description: 'You can see and manage all tasks in this project'
      };
    } else {
      return {
        label: 'Team Member',
        description: 'You can see all tasks in this project'
      };
    }
  };

  const roleInfo = getUserRoleInfo();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
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
      {canCreateTasks && (
        <CreateTaskForm 
          projectId={project.id} 
          onTaskCreated={onTaskCreated}
          members={project.members}
          projectData={project}
        />
      )}
    </div>
  );
} 