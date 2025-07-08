"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Member } from '../../types';

interface UserSelectDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  members: Member[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function UserSelectDropdown({
  value,
  onValueChange,
  members,
  placeholder = "Select a team member",
  disabled = false,
  className,
  required = false
}: UserSelectDropdownProps) {
  // Find the selected member's data
  const selectedMember = members.find(m => m.userId === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger 
        className={cn(
          "bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
      >
        {selectedMember ? (
          <div className="flex items-center gap-2 flex-1">
            <Avatar className="w-6 h-6">
              <AvatarImage 
                src={selectedMember.userImage || undefined} 
                alt={selectedMember.userName}
              />
              <AvatarFallback className="text-xs font-medium bg-[#008080] dark:bg-[#00FFFF] text-white dark:text-gray-900">
                {selectedMember.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-left truncate">{selectedMember.userName}</span>
          </div>
        ) : (
          <SelectValue placeholder={`${placeholder}${required ? ' *' : ''}`} />
        )}
      </SelectTrigger>
      <SelectContent>
        {members.map((member) => (
          <SelectItem key={member.userId} value={member.userId}>
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage 
                  src={member.userImage || undefined} 
                  alt={member.userName}
                />
                <AvatarFallback className="text-xs font-medium bg-[#008080] dark:bg-[#00FFFF] text-white dark:text-gray-900">
                  {member.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{member.userName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{member.userEmail}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 