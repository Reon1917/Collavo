import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Edit3, Settings, Eye } from 'lucide-react';
import { EditMode } from '../types';
import { StatusBadge } from './StatusBadge';
import { SubTask } from '../../../../types';

interface DialogHeaderProps {
  editMode: EditMode;
  subTask: SubTask;
}

export function DialogHeader({ editMode, subTask }: DialogHeaderProps) {
  const getHeaderContent = () => {
    switch (editMode) {
      case 'status':
        return {
          icon: <Edit3 className="h-5 w-5 text-[#008080]" />,
          title: 'Update Status & Notes',
          description: 'Update the status and add notes about your progress.'
        };
      case 'details':
        return {
          icon: <Settings className="h-5 w-5 text-[#008080]" />,
          title: 'Edit Subtask Details',
          description: 'Edit subtask details including title, deadline, and assignment.'
        };
      default:
        return {
          icon: <Eye className="h-5 w-5 text-[#008080]" />,
          title: 'Subtask Details',
          description: 'View and manage subtask details and progress.'
        };
    }
  };

  const { icon, title, description } = getHeaderContent();

  return (
    <div className="flex items-center justify-between">
      <div>
        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {icon}
          {title}
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </DialogDescription>
      </div>
      
      {editMode === 'view' && (
        <div className="flex items-center gap-2">
          <StatusBadge status={subTask.status} className="text-sm px-3 py-1" />
        </div>
      )}
    </div>
  );
} 