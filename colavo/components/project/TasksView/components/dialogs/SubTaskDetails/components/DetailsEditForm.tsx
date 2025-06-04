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
              <SelectValue placeholder="Select member *" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.userName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <Calendar
              mode="single"
              selected={detailsFormData.deadline}
              onSelect={(date) => setDetailsFormData(prev => ({ ...prev, deadline: date }))}
              disabled={(date) => {
                const today = new Date();
                if (date < today) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 