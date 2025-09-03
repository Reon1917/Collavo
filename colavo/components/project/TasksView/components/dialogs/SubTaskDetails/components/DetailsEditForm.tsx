import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MemberSelect } from '../../../shared';
import { CalendarIcon, AlertCircle, CheckCircle2, Play, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { DetailsFormData } from '../types';
import { Member } from '../../../../types';

interface DetailsEditFormProps {
  detailsFormData: DetailsFormData;
  setDetailsFormData: (data: DetailsFormData | ((prev: DetailsFormData) => DetailsFormData)) => void;
  members: Member[];
  mainTaskDeadline: string | null;
  projectDeadline: string | null;
  isLoading: boolean;
  isManagementMode?: boolean;
}

export function DetailsEditForm({ 
  detailsFormData, 
  setDetailsFormData, 
  members, 
  mainTaskDeadline, 
  projectDeadline, 
  isLoading,
  isManagementMode = false
}: DetailsEditFormProps) {

  // Get maximum allowed date based on task and project deadlines
  const getMaxDate = () => {
    const dates = [mainTaskDeadline, projectDeadline].filter(Boolean).map(d => new Date(d!));
    if (dates.length === 0) return undefined;
    return new Date(Math.min(...dates.map(d => d.getTime())));
  };

  // Generate deadline options based on constraints
  const getDeadlineOptions = () => {
    const today = new Date();
    const standardOptions = [
      { label: 'Tomorrow', value: addDays(today, 1) },
      { label: 'This week', value: addDays(today, 7) },
      { label: 'Next week', value: addWeeks(today, 1) },
      { label: 'This month', value: addMonths(today, 1) },
    ];

    // Filter options based on task/project deadlines
    const maxDate = getMaxDate();
    
    return standardOptions.filter(option => {
      if (maxDate && option.value > maxDate) return false;
      return true;
    });
  };

  const deadlineOptions = getDeadlineOptions();

  const isDateValid = (date: Date) => {
    const maxDate = getMaxDate();
    if (maxDate && date > maxDate) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {(mainTaskDeadline || projectDeadline) && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            {mainTaskDeadline && (
              <p>Main task deadline: {format(new Date(mainTaskDeadline), "PPP")}</p>
            )}
            {projectDeadline && (
              <p>Project deadline: {format(new Date(projectDeadline), "PPP")}</p>
            )}
            <p className="font-medium">Subtask deadline cannot exceed either deadline.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Title *
          </Label>
          <Input
            id="edit-title"
            value={detailsFormData.title}
            onChange={(e) => setDetailsFormData(prev => ({ ...prev, title: e.target.value }))}
            className="bg-background border-border"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Assign to *
          </Label>
          <MemberSelect
            members={members}
            value={detailsFormData.assignedId}
            onValueChange={(value) => setDetailsFormData(prev => ({ ...prev, assignedId: value }))}
            placeholder="Select member *"
            className="bg-background border-border"
            disabled={isLoading}
          />
          {detailsFormData.assignedId && !members.find(m => m.userId === detailsFormData.assignedId) && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              ⚠️ Assigned user is no longer a project member. Please reassign to an active member.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </Label>
        <Textarea
          id="edit-description"
          value={detailsFormData.description}
          onChange={(e) => setDetailsFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-background border-border min-h-[100px] resize-none"
          disabled={isLoading}
          placeholder="Describe the subtask requirements and objectives..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Deadline *
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-background border-border",
                !detailsFormData.deadline && "text-gray-500 dark:text-gray-400",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {detailsFormData.deadline ? format(detailsFormData.deadline, "PPP") : "Select deadline *"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={detailsFormData.deadline}
              onSelect={(date) => setDetailsFormData(prev => ({ ...prev, deadline: date }))}
              disabled={(date) => date < new Date() || !isDateValid(date)}
              initialFocus
            />
            {deadlineOptions.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Select:</p>
                <div className="space-y-1">
                  {deadlineOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-left justify-start h-auto py-1 px-2"
                      onClick={() => setDetailsFormData(prev => ({ ...prev, deadline: option.value }))}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {isManagementMode && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status & Progress</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">(Management only)</span>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'pending' as const, label: 'Pending', icon: Clock, className: 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600' },
                  { value: 'in_progress' as const, label: 'In Progress', icon: Play, className: 'hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-300 dark:border-blue-600 hover:text-blue-700 dark:hover:text-blue-300' },
                  { value: 'completed' as const, label: 'Completed', icon: CheckCircle2, className: 'hover:bg-green-50 dark:hover:bg-green-950/20 border-green-300 dark:border-green-600 hover:text-green-700 dark:hover:text-green-300' }
                ].map((button) => {
                  const Icon = button.icon;
                  const isSelected = detailsFormData.status === button.value;
                  
                  return (
                    <Button
                      key={button.value}
                      type="button"
                      variant="outline"
                      onClick={() => setDetailsFormData(prev => ({ ...prev, status: button.value }))}
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
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress Notes <span className="text-gray-500">(Optional)</span>
              </Label>
              <Textarea
                placeholder="Add notes about progress, challenges, or updates..."
                value={detailsFormData.note || ''}
                onChange={(e) => setDetailsFormData(prev => ({ ...prev, note: e.target.value }))}
                className="bg-background border-border focus:bg-card focus:border-primary min-h-[100px] resize-none"
                disabled={isLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
} 