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
  isFullEditMode?: boolean;
}

export function DetailsEditForm({ 
  detailsFormData, 
  setDetailsFormData, 
  members, 
  mainTaskDeadline, 
  projectDeadline, 
  isLoading,
  isManagementMode = false,
  isFullEditMode = false
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
    <div className={isFullEditMode ? "space-y-4" : "space-y-6"}>
      {(mainTaskDeadline || projectDeadline) && (
        <div className={`flex items-start gap-3 ${isFullEditMode ? "p-3" : "p-4"} bg-primary/5 dark:bg-primary/5 border border-primary/20 dark:border-primary/20 rounded-lg`}>
          <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-primary/90 dark:text-primary/90">
            {mainTaskDeadline && (
              <p>Main task deadline: {format(new Date(mainTaskDeadline), "PPP")}</p>
            )}
            {projectDeadline && (
              <p>Project deadline: {format(new Date(projectDeadline), "PPP")}</p>
            )}
            {!isFullEditMode && <p className="font-medium">Subtask deadline cannot exceed either deadline.</p>}
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isFullEditMode ? "gap-4" : "md:grid-cols-2 gap-6"}`}>
        <div className="space-y-2">
          <Label htmlFor="edit-title" className="text-sm font-medium text-foreground dark:text-foreground">
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
          <Label className="text-sm font-medium text-foreground dark:text-foreground">
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
        <Label htmlFor="edit-description" className="text-sm font-medium text-foreground dark:text-foreground">
          Description
        </Label>
        <Textarea
          id="edit-description"
          value={detailsFormData.description}
          onChange={(e) => setDetailsFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`bg-background border-border ${isFullEditMode ? "min-h-[80px]" : "min-h-[100px]"} resize-none`}
          disabled={isLoading}
          placeholder="Describe the subtask requirements and objectives..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground dark:text-foreground">
          Deadline *
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-background border-border",
                !detailsFormData.deadline && "text-muted-foreground dark:text-muted-foreground",
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
              <div className="p-3 border-t border-border dark:border-border">
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-2">Quick Select:</p>
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
          <div className="border-t border-border dark:border-border my-6"></div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Status & Progress</h3>
              <span className="text-sm text-muted-foreground dark:text-muted-foreground">(Management only)</span>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground dark:text-foreground">Status</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'pending' as const, label: 'Pending', icon: Clock, className: 'hover:bg-muted dark:hover:bg-muted border-border dark:border-border' },
                  { value: 'in_progress' as const, label: 'In Progress', icon: Play, className: 'hover:bg-primary/10 dark:hover:bg-primary/10 border-primary/30 dark:border-primary/30 hover:text-primary dark:hover:text-primary' },
                  { value: 'completed' as const, label: 'Completed', icon: CheckCircle2, className: 'hover:bg-primary/5 dark:hover:bg-primary/5 border-primary/20 dark:border-primary/20 hover:text-primary/80 dark:hover:text-primary/80' }
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
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground dark:text-foreground">
                Progress Notes <span className="text-muted-foreground">(Optional)</span>
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