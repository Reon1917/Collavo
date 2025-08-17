import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { CreateTaskForm } from '@/components/project/TasksView/components/forms/CreateTaskForm';
import { Project, Task } from '../types';

interface EmptyStateProps {
  project: Project;
  totalTasks: number;
  onTaskCreated: (newTask: Task) => void;
}

export function EmptyState({ project, totalTasks, onTaskCreated }: EmptyStateProps) {
  const canCreateTasks = project.userPermissions.includes('createTask');
  const canViewAllTasks = project.isLeader || project.userPermissions.includes('viewFiles');

  const getEmptyMessage = () => {
    if (totalTasks === 0) {
      return {
        title: 'No tasks found',
        description: canViewAllTasks 
          ? 'No tasks have been created for this project yet.'
          : 'You are not assigned to any tasks in this project yet.'
      };
    } else {
      return {
        title: 'No tasks match your filters',
        description: 'Try adjusting your search or filter criteria.'
      };
    }
  };

  const { title, description } = getEmptyMessage();

  return (
    <Card className="bg-background dark:bg-card border border-border/60 dark:border-border">
      <CardContent className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground dark:text-muted-foreground mb-4">
          {description}
        </p>
        {canCreateTasks && totalTasks === 0 && (
          <CreateTaskForm 
            projectId={project.id} 
            onTaskCreated={onTaskCreated}
            members={project.members}
            projectData={project}
          />
        )}
      </CardContent>
    </Card>
  );
} 