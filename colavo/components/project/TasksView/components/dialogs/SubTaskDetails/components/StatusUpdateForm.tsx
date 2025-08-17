import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusFormData, EditMode } from '../types';
import { SubTask } from '../../../../types';
import { StatusBadge } from './StatusBadge';

interface StatusUpdateFormProps {
  subTask: SubTask;
  statusFormData: StatusFormData;
  setStatusFormData: (data: StatusFormData | ((prev: StatusFormData) => StatusFormData)) => void;
  editMode: EditMode;
  isLoading: boolean;
}

export function StatusUpdateForm({ 
  subTask, 
  statusFormData, 
  setStatusFormData, 
  editMode,
  isLoading 
}: StatusUpdateFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Status</Label>
        {editMode === 'status' ? (
          <Select
            value={statusFormData.status}
            onValueChange={(value) => 
              setStatusFormData(prev => ({ ...prev, status: value as 'pending' | 'in_progress' | 'completed' }))
            }
          >
            <SelectTrigger className="bg-background dark:bg-muted border-border dark:border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2">
            <StatusBadge status={subTask.status} className="text-sm px-3 py-1" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Progress Notes {editMode === 'status' && <span className="text-muted-foreground">(Optional)</span>}
        </Label>
        {editMode === 'status' ? (
          <Textarea
            placeholder="Add notes about your progress, challenges, or updates..."
            value={statusFormData.note}
            onChange={(e) => setStatusFormData(prev => ({ ...prev, note: e.target.value }))}
            className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary min-h-[120px] resize-none"
            disabled={isLoading}
          />
        ) : (
          <div className="min-h-[120px] p-4 bg-muted dark:bg-muted border border-border dark:border-border rounded-md">
            {subTask.note ? (
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{subTask.note}</p>
            ) : (
              <p className="text-muted-foreground dark:text-muted-foreground italic">No progress notes added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 