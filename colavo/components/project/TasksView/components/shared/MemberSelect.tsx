import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Member } from '../../types';
import { UserAvatar } from './UserAvatar';

interface MemberSelectProps {
  members: Member[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MemberSelect({ 
  members, 
  value, 
  onValueChange, 
  placeholder = "Select member *",
  className,
  disabled = false
}: MemberSelectProps) {
  const selectedMember = members.find(m => m.userId === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger 
        className={cn(
          "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedMember ? (
            <>
              <UserAvatar 
                userImage={selectedMember.userImage} 
                userName={selectedMember.userName} 
                size="sm" 
              />
              <span className="text-left">{selectedMember.userName}</span>
            </>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {members.map((member) => (
          <SelectItem key={member.userId} value={member.userId}>
            <div className="flex items-center gap-2">
              <UserAvatar 
                userImage={member.userImage} 
                userName={member.userName} 
                size="sm" 
              />
              <span>{member.userName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}