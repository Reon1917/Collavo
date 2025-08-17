'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPresence } from '@/types';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUserIds: string[];
  onlineMembers: UserPresence[];
  className?: string;
}

export function TypingIndicator({ typingUserIds, onlineMembers, className }: TypingIndicatorProps) {
  if (typingUserIds.length === 0) return null;

  // Get user details for typing users
  const typingUsers = typingUserIds
    .map(userId => onlineMembers.find(member => member.userId === userId))
    .filter(Boolean) as UserPresence[];

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]?.user?.name || 'Someone'} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]?.user?.name || 'Someone'} and ${typingUsers[1]?.user?.name || 'someone'} are typing...`;
    } else {
      return `${typingUsers[0]?.user?.name || 'Someone'} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2", className)}>
      {/* Show avatars of typing users (max 3) */}
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.userId} className="h-6 w-6 border-2 border-white dark:border-border">
            <AvatarImage src={user.user?.image || undefined} alt={user.user?.name || 'User'} />
            <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {(user.user?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Typing text with animated dots */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-muted-foreground">
        <span>{getTypingText()}</span>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-gray-400 dark:bg-muted0 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-1 bg-gray-400 dark:bg-muted0 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-1 bg-gray-400 dark:bg-muted0 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
} 