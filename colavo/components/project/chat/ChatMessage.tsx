'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageType } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { MoreHorizontal, Reply, Edit2, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EditingInterface } from './EditingInterface';
import { ReplyDisplay } from './ReplyDisplay';

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserId: string;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (messageId: string, content: string) => Promise<void>;
  onDelete?: (messageId: string) => Promise<void>;
  className?: string;
}

export function ChatMessage({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  className
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCurrentUser = message.userId === currentUserId;
  const userName = message.user?.name || 'Unknown User';
  const userAvatar = message.user?.image;

  const handleEditSubmit = async () => {
    if (!onEdit || editContent.trim() === message.content.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(message.id, editContent.trim());
      setIsEditing(false);
    } catch {
      // Error toast is already handled in the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(message.id);
    } catch {
      // Error toast is already handled in the mutation
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div
      className={cn(
        'group flex flex-col px-2 py-1',
        isCurrentUser ? 'items-end' : 'items-start',
        className
      )}
    >
      {/* Sender name above bubble for other users only */}
      {!isCurrentUser && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 ml-8">
          {userName}
        </span>
      )}
      <div className={cn(
        'flex items-end max-w-[85%]',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar for other users only */}
        {!isCurrentUser && (
          <Avatar className="h-5 w-5 flex-shrink-0 mr-2">
            <AvatarImage src={userAvatar || undefined} alt={userName} />
            <AvatarFallback className="text-[10px] font-medium bg-secondary text-secondary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        {/* Message bubble */}
        <div
          className={cn(
            'relative rounded-xl px-3 py-2 text-xs break-words',
            isCurrentUser
              ? 'bg-primary text-primary-foreground ml-2'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
            'transition-colors'
          )}
        >
          {/* Reply display if needed */}
          <ReplyDisplay
            message={message}
            currentUserId={currentUserId}
            isCurrentUser={isCurrentUser}
            userName={userName}
          />
          {/* Message content */}
          {isEditing ? (
            <EditingInterface
              editContent={editContent}
              onContentChange={setEditContent}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              onKeyDown={handleKeyPress}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="leading-relaxed">
              {message.content}
            </div>
          )}
          {/* Timestamp on hover, beside bubble */}
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap',
              isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'
            )}
            aria-label="Message time"
          >
            {formatDistanceToNow(message.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
} 