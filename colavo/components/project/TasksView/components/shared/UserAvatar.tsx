import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  userImage?: string | null;
  userName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name: string): string => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return 'U';
  
  if (words.length === 1) {
    return words[0]?.charAt(0).toUpperCase() || 'U';
  }
  
  return words
    .slice(0, 2)
    .map(word => word?.charAt(0)?.toUpperCase() || '')
    .join('');
};

const sizeClasses = {
  xs: 'h-5 w-5 text-xs',
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-12 w-12 text-lg'
};

export function UserAvatar({ userImage, userName, size = 'md', className }: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={userImage || undefined} alt={`${userName}'s avatar`} />
      <AvatarFallback className="bg-[#008080] text-white font-medium">
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  );
}