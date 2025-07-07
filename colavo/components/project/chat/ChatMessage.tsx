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
        "px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors",
        message.replyTo && "pt-0", // Remove top padding when there's a reply to show the reply header flush
        className
      )}
    >
      {isCurrentUser ? (
        /* Current User Layout: Actions - Avatar - Message (message touches right edge) */
        <div className="flex gap-3 ml-auto max-w-[85%]">
          {/* Message Actions - positioned to the left */}
          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start pt-1">
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
                <DropdownMenuContent align="start" className="w-40">
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
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
          
          {/* Avatar */}
          <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
            <AvatarImage src={userAvatar || undefined} alt={userName} />
            <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Message Content */}
          <div className="flex-1 min-w-0 rounded-2xl px-4 py-3 shadow-sm bg-primary text-primary-foreground">
            {/* Username Line */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-primary-foreground/90">
                {userName}
              </span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20">
                You
              </Badge>
              {message.isEdited && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-4 border-primary-foreground/30 text-primary-foreground/70">
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
            <ReplyDisplay 
              message={message}
              currentUserId={currentUserId}
              isCurrentUser={isCurrentUser}
              userName={userName}
            />

            {/* Message Content Line */}
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
              <div className="text-sm break-words mb-1 leading-relaxed text-primary-foreground">
                {message.content}
              </div>
            )}

            {/* Timestamp Line */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs cursor-default text-primary-foreground/70">
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
              <div className="text-xs italic mt-1 text-primary-foreground/70">
                System message
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Other User Layout: Avatar - Message - Actions */
        <div className="flex gap-3 mr-auto max-w-[85%]">
          {/* Avatar */}
          <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
            <AvatarImage src={userAvatar || undefined} alt={userName} />
            <AvatarFallback className="text-sm font-medium bg-secondary text-secondary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

                     {/* Message Content */}
           <div className="flex-1 min-w-0 rounded-2xl px-4 py-3 shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
             {/* Username Line */}
             <div className="flex items-center gap-2 mb-1">
               <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                 {userName}
               </span>
               {message.isEdited && (
                 <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-4 border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
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
             <ReplyDisplay 
               message={message}
               currentUserId={currentUserId}
               isCurrentUser={isCurrentUser}
               userName={userName}
             />

             {/* Message Content Line */}
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
               <div className="text-sm break-words mb-1 leading-relaxed text-gray-900 dark:text-gray-100">
                 {message.content}
               </div>
             )}

             {/* Timestamp Line */}
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <div className="text-xs cursor-default text-gray-500 dark:text-gray-400">
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
               <div className="text-xs italic mt-1 text-gray-500 dark:text-gray-400">
                 System message
               </div>
             )}
           </div>

           {/* Message Actions */}
           {!isEditing && (
             <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start pt-1">
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
                 <DropdownMenuContent align="end" className="w-40">
                   {onReply && (
                     <DropdownMenuItem onClick={() => onReply(message)}>
                       <Reply className="h-4 w-4 mr-2" />
                       Reply
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           )}
         </div>
       )}
    </div>
  );
} 