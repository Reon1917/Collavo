import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DetailsFormData } from '../types';
import { Member } from '../../../../types';
import { getMaxDate } from '../utils';

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
  const maxDate = getMaxDate(mainTaskDeadline, projectDeadline);
  
  // Get the selected member's name for display
  const selectedMember = members.find(m => m.userId === detailsFormData.assignedId);
  const selectedMemberName = selectedMember?.userName;

  const getDeadlineOptions = () => {
    const options = [];
    
    if (mainTaskDeadline) {
      options.push({
        label: `Main Task Deadline: ${format(new Date(mainTaskDeadline), "PPP")}`,
        value: new Date(mainTaskDeadline),
      });
    }
    
    if (projectDeadline) {
      options.push({
        label: `Project Deadline: ${format(new Date(projectDeadline), "PPP")}`,
        value: new Date(projectDeadline),
      });
    }
    
    return options;
  };

  const deadlineOptions = getDeadlineOptions();

  const isDateValid = (date: Date) => {
    if (mainTaskDeadline && date > new Date(mainTaskDeadline)) {
      return false;
    }
    if (projectDeadline && date > new Date(projectDeadline)) {
      return false;
    }
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

      {/* Email Notification Section */}
      {detailsFormData.deadline && detailsFormData.assignedId && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#008080] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📧</span>
            </div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Reminder (Optional)
            </Label>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Set up an email reminder for the assigned user before the deadline.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Days Before Deadline
                </Label>
                <Select defaultValue="3">
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Time (Bangkok)
                </Label>
                <Input 
                  type="time" 
                  defaultValue="09:00"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
              Note: Notification will be set up after the subtask is saved with a deadline and assignee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 