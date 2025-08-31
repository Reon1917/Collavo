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
      className: 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
    },
    {
      value: 'in_progress' as const,
      label: 'In Progress',
      icon: Play,
      className: 'hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-300 dark:border-blue-600 hover:text-blue-700 dark:hover:text-blue-300'
    },
    {
      value: 'completed' as const,
      label: 'Completed',
      icon: CheckCircle2,
      className: 'hover:bg-green-50 dark:hover:bg-green-950/20 border-green-300 dark:border-green-600 hover:text-green-700 dark:hover:text-green-300'
    }
  ];

  const handleStatusChange = (status: 'pending' | 'in_progress' | 'completed') => {
    setStatusFormData(prev => ({ ...prev, status }));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
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
                        ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 text-gray-800 dark:text-gray-200'
                        : button.value === 'in_progress'
                        ? 'bg-blue-100 dark:bg-blue-950/30 border-blue-500 dark:border-blue-400 text-blue-800 dark:text-blue-200'
                        : 'bg-green-100 dark:bg-green-950/30 border-green-500 dark:border-green-400 text-green-800 dark:text-green-200'
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
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progress Notes {editMode === 'status' && <span className="text-gray-500">(Optional)</span>}
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
          <div className="min-h-[100px] p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            {subTask.note ? (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{subTask.note}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-500 italic text-sm">No progress notes added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 