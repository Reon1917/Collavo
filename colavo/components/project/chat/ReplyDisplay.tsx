'use client';

import { Reply } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types';

interface ReplyDisplayProps {
  message: ChatMessageType;
  currentUserId: string;
  isCurrentUser: boolean;
  userName: string;
}

export function ReplyDisplay({ 
  message, 
  currentUserId, 
  isCurrentUser, 
  userName 
}: ReplyDisplayProps) {
  if (!message.replyTo || !message.parentMessage) {
    return null;
  }

  return (
    <div className="mb-3 -mx-4 -mt-3 pt-2 pb-3 px-4 bg-blue-50/30 dark:bg-blue-900/10 border-b border-blue-200/30 dark:border-blue-800/30">
      <div className="flex items-center gap-1 mb-2">
        <Reply className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
          {message.parentMessage.userId === currentUserId 
            ? 'replied to you' 
            : isCurrentUser 
              ? `you replied to ${message.parentMessage.user?.name || 'someone'}`
              : `${userName} replied to ${message.parentMessage.user?.name || 'someone'}`
          }
        </div>
      </div>
      <div className="text-xs text-muted-foreground bg-background/60 dark:bg-muted/60 p-2.5 rounded border-l-4 border-blue-400 dark:border-blue-500 italic leading-relaxed">
        {message.parentMessage.content}
      </div>
    </div>
  );
}