'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageType } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { MoreHorizontal, Reply, Edit2, Trash2, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
    } catch (error) {
      console.error('Failed to edit message:', error);
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
    } catch (error) {
      console.error('Failed to delete message:', error);
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
        "px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors",
        className
      )}
    >
      <div className={cn(
        "flex gap-3 max-w-[85%]",
        isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}>
        {/* Avatar */}
        <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
          <AvatarImage src={userAvatar || undefined} alt={userName} />
          <AvatarFallback className={cn(
            "text-sm font-medium",
            isCurrentUser 
              ? "bg-blue-600 text-white" 
              : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          )}>
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className={cn(
          "flex-1 min-w-0 rounded-2xl px-4 py-3 shadow-sm",
          isCurrentUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        )}>
          {/* Username Line */}
          <div className={cn(
            "flex items-center gap-2 mb-1",
            isCurrentUser ? "flex-row-reverse" : ""
          )}>
            <span className={cn(
              "text-sm font-semibold",
              isCurrentUser ? "text-blue-100" : "text-gray-900 dark:text-gray-100"
            )}>
              {userName}
            </span>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4 bg-blue-500 text-white border-blue-400">
                You
              </Badge>
            )}
            {message.isEdited && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={cn(
                      "text-xs px-1.5 py-0.5 h-4",
                      isCurrentUser 
                        ? "border-blue-400 text-blue-200" 
                        : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                    )}>
                      edited
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {message.editedAt ? format(message.editedAt, 'PPpp') : 'Edited'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Reply to previous message */}
          {message.replyTo && message.parentMessage && (
            <div className={cn(
              "mb-2 p-2 border-l-2 rounded-r text-sm",
              isCurrentUser
                ? "border-blue-300 bg-blue-500/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            )}>
              <div className={cn(
                "text-xs mb-1",
                isCurrentUser ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
              )}>
                Replying to {message.parentMessage.userId === currentUserId ? 'yourself' : 'someone'}
              </div>
              <div className={cn(
                "truncate",
                isCurrentUser ? "text-blue-100" : "text-gray-700 dark:text-gray-300"
              )}>
                {message.parentMessage.content}
              </div>
            </div>
          )}

          {/* Message Content Line */}
          {isEditing ? (
            <div className="space-y-2 mb-1">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Edit message..."
                disabled={isSubmitting}
                className="text-sm"
              />
              <div className={cn(
                "flex gap-2",
                isCurrentUser ? "flex-row-reverse" : ""
              )}>
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  disabled={isSubmitting || editContent.trim() === ''}
                  className="h-7 px-3 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEditCancel}
                  disabled={isSubmitting}
                  className="h-7 px-3 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "text-sm break-words mb-1 leading-relaxed",
              isCurrentUser ? "text-white" : "text-gray-900 dark:text-gray-100"
            )}>
              {message.content}
            </div>
          )}

          {/* Timestamp Line */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "text-xs cursor-default",
                  isCurrentUser ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                )}>
                  {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {format(message.createdAt, 'PPpp')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* System message styling */}
          {message.messageType === 'system' && (
            <div className={cn(
              "text-xs italic mt-1",
              isCurrentUser ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
            )}>
              System message
            </div>
          )}
        </div>

        {/* Message Actions */}
        {!isEditing && (
          <div className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity flex items-start pt-1",
            isCurrentUser ? "order-first" : ""
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? "start" : "end"} className="w-40">
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                {isCurrentUser && onEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {isCurrentUser && onDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
} 