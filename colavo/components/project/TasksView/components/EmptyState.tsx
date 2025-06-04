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
    <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
      <CardContent className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
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