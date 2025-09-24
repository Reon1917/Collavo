import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusFormData, EditMode } from '../types';
import { SubTask } from '../../../../types';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, Play, Clock } from 'lucide-react';

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
  const statusButtons = [
    {
      value: 'pending' as const,
      label: 'Pending',
      icon: Clock,
      className: 'hover:bg-muted dark:hover:bg-muted border-border dark:border-border'
    },
    {
      value: 'in_progress' as const,
      label: 'In Progress',
      icon: Play,
      className: 'hover:bg-primary/10 dark:hover:bg-primary/10 border-primary/30 dark:border-primary/30 hover:text-primary dark:hover:text-primary'
    },
    {
      value: 'completed' as const,
      label: 'Completed',
      icon: CheckCircle2,
      className: 'hover:bg-primary/5 dark:hover:bg-primary/5 border-primary/20 dark:border-primary/20 hover:text-primary/80 dark:hover:text-primary/80'
    }
  ];

  const handleStatusChange = (status: 'pending' | 'in_progress' | 'completed') => {
    setStatusFormData(prev => ({ ...prev, status }));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground dark:text-foreground">Status</Label>
        {editMode === 'status' ? (
          <div className="grid grid-cols-3 gap-2">
            {statusButtons.map((button) => {
              const Icon = button.icon;
              const isSelected = statusFormData.status === button.value;
              
              return (
                <Button
                  key={button.value}
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusChange(button.value)}
                  disabled={isLoading}
                  className={`relative h-12 transition-all duration-200 ${
                    isSelected
                      ? button.value === 'pending'
                        ? 'bg-muted dark:bg-muted border-border dark:border-border text-foreground dark:text-foreground'
                        : button.value === 'in_progress'
                        ? 'bg-primary/15 dark:bg-primary/15 border-primary dark:border-primary text-primary dark:text-primary'
                        : 'bg-primary/10 dark:bg-primary/10 border-primary/70 dark:border-primary/70 text-primary/90 dark:text-primary/90'
                      : button.className
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{button.label}</span>
                  {isSelected && (
                    <div className="absolute inset-0 bg-current opacity-10 rounded-md" />
                  )}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <StatusBadge status={subTask.status} className="text-sm px-3 py-1" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground dark:text-foreground">
          Progress Notes {editMode === 'status' && <span className="text-muted-foreground">(Optional)</span>}
        </Label>
        {editMode === 'status' ? (
          <Textarea
            placeholder="Add notes about your progress, challenges, or updates..."
            value={statusFormData.note}
            onChange={(e) => setStatusFormData(prev => ({ ...prev, note: e.target.value }))}
            className="bg-background border-border focus:bg-card focus:border-primary min-h-[100px] resize-none"
            disabled={isLoading}
          />
        ) : (
          <div className="min-h-[100px] p-3 bg-muted dark:bg-muted border border-border dark:border-border rounded-md">
            {subTask.note ? (
              <p className="text-foreground dark:text-foreground whitespace-pre-wrap leading-relaxed text-sm">{subTask.note}</p>
            ) : (
              <p className="text-muted-foreground dark:text-muted-foreground italic text-sm">No progress notes added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 