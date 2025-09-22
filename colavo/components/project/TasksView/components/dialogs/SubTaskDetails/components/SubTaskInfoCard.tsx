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
    <div className="border border-border dark:border-border rounded-lg p-4 space-y-3">
      <div>
        <Label className="text-sm font-medium text-foreground dark:text-foreground">Title</Label>
        <h3 className="text-base font-semibold text-foreground dark:text-foreground mt-1">{subTask.title}</h3>
      </div>

      {subTask.description && (
        <div>
          <Label className="text-sm font-medium text-foreground dark:text-foreground">Description</Label>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1 leading-relaxed">{subTask.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div>
          <Label className="text-sm font-medium text-foreground dark:text-foreground">Assigned to</Label>
          <div className="flex items-center gap-2 mt-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground dark:text-foreground font-medium">
              {subTask.assignedUserName || 'Unassigned'}
              {subTask.assignedId === currentUserId && (
                <span className="text-primary ml-1">(You)</span>
              )}
            </span>
          </div>
        </div>

        {subTask.deadline && (
          <div>
            <Label className="text-sm font-medium text-foreground dark:text-foreground">Deadline</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground dark:text-foreground font-medium">
                {format(new Date(subTask.deadline), 'PPP')}
              </span>
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-foreground dark:text-foreground">Created</Label>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground dark:text-foreground font-medium">
              {format(new Date(subTask.createdAt), 'PPP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 