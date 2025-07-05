'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { UserPresence } from '@/types';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnlineMembersProps {
  onlineMembers: UserPresence[];
  currentUserId: string;
  className?: string;
}

export function OnlineMembers({ onlineMembers, currentUserId, className }: OnlineMembersProps) {
  if (onlineMembers.length === 0) return null;

  // Sort to show current user first, then others
  const sortedMembers = [...onlineMembers].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return (a.user?.name || '').localeCompare(b.user?.name || '');
  });

  const displayMembers = sortedMembers.slice(0, 5); // Show max 5 avatars
  const extraCount = Math.max(0, onlineMembers.length - 5);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
        <Badge variant="secondary" className="text-xs px-2 py-1">
          {onlineMembers.length} online
        </Badge>
      </div>

      {/* Online member avatars */}
      <div className="flex -space-x-1">
        {displayMembers.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const userName = member.user?.name || 'Unknown User';
          
          return (
            <TooltipProvider key={member.userId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800">
                      <AvatarImage src={member.user?.image || undefined} alt={userName} />
                      <AvatarFallback className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-white dark:border-gray-800" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {isCurrentUser ? `${userName} (You)` : userName}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {/* Show extra count if there are more members */}
        {extraCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-6 w-6 bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 rounded-full">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    +{extraCount}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{extraCount} more online</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
} 