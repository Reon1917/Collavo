import { Label } from '@/components/ui/label';
import { User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { SubTask } from '../../../../types';

interface SubTaskInfoCardProps {
  subTask: SubTask;
  currentUserId: string;
}

export function SubTaskInfoCard({ subTask, currentUserId }: SubTaskInfoCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{subTask.title}</h3>
      </div>

      {subTask.description && (
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
          <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{subTask.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned to</Label>
          <div className="flex items-center gap-2 mt-1">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {subTask.assignedUserName || 'Unassigned'}
              {subTask.assignedId === currentUserId && (
                <span className="text-primary ml-1">(You)</span>
              )}
            </span>
          </div>
        </div>

        {subTask.deadline && (
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                {format(new Date(subTask.deadline), 'PPP')}
              </span>
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {format(new Date(subTask.createdAt), 'PPP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 