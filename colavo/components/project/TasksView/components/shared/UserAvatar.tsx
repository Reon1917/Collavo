import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  userImage?: string | null;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export function UserAvatar({ userImage, userName, size = 'md', className }: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={userImage || undefined} alt={userName} />
      <AvatarFallback className="bg-[#008080] text-white text-xs font-medium">
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  );
}