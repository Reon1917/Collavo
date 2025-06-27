import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { DetailsFormData, Member } from '../../../types';

interface DetailsEditFormProps {
  detailsFormData: DetailsFormData;
  setDetailsFormData: (data: DetailsFormData | ((prev: DetailsFormData) => DetailsFormData)) => void;
  members: Member[];
  mainTaskDeadline: string | null;
  projectDeadline: string | null;
  isLoading: boolean;
}

export function DetailsEditForm({ 
  detailsFormData, 
  setDetailsFormData, 
  members, 
  mainTaskDeadline, 
  projectDeadline, 
  isLoading 
}: DetailsEditFormProps) {
  // Find the selected member's name
  const selectedMemberName = members.find(m => m.userId === detailsFormData.assignedId)?.userName;

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
            className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Assign to *
          </Label>
          <Select
            value={detailsFormData.assignedId}
            onValueChange={(value) => setDetailsFormData(prev => ({ ...prev, assignedId: value }))}
          >
            <SelectTrigger 
              className={cn(
                "bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className={cn(
                "flex-1 text-left",
                !selectedMemberName && "text-gray-500 dark:text-gray-400"
              )}>
                {selectedMemberName || "Select member *"}
              </span>
              <svg 
                width="15" 
                height="15" 
                viewBox="0 0 15 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 opacity-50"
              >
                <path 
                  d="m4.93179 5.43179c.20264-.20264.53132-.20264.73396 0l2.33439 2.33438 2.3344-2.33438c.2026-.20264.5313-.20264.7339 0 .2027.20263.2027.53131 0 .73395L7.66957 9.5678c-.20264.2027-.53132.2027-.73396 0L3.66821 6.16574c-.20264-.20264-.20264-.53132 0-.73395Z" 
                  fill="currentColor" 
                  fillRule="evenodd" 
                  clipRule="evenodd"
                />
              </svg>
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.userName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 min-h-[100px] resize-none"
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
                "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700",
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
    </div>
  );
} 