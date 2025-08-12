'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

import { Send, X, Loader2, Wifi, WifiOff, ChevronDown, Reply } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useProjectChat } from '@/hooks/useProjectChat';
import { ChatMessage } from './chat/ChatMessage';
import { TypingIndicator } from './chat/TypingIndicator';
import { OnlineMembers } from './chat/OnlineMembers';
import { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/useClickOutside';

interface ChatBoxProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  className?: string;
}

export function ChatBox({ projectId, projectName, onClose, className }: ChatBoxProps) {
  const { data: session } = authClient.useSession();
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessageType | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Get chat state
  const {
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    onlineMembers,
    isLoading,
    error,
    isConnected,
    hasMore,
    loadMoreMessages,
    startTyping,
    stopTyping,
    isTyping,
  } = useProjectChat(projectId, session?.user?.id || '', { enabled: !!session?.user?.id });

  // Auto-scroll to bottom when new messages arrive (but only if user is at bottom)
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Handle click outside to close chat box
  useClickOutside(chatBoxRef, onClose, {
    ignoreSelectors: [
      '[data-radix-dropdown-menu-content]',
      '[data-radix-popper-content-wrapper]',
      '[data-radix-portal]',
      '[role="menu"]',
      '[role="menuitem"]',
      '[data-slot="dropdown-menu-content"]',
      '[data-slot="dropdown-menu-item"]',
      '[data-radix-collection-item]',
      '[data-radix-dropdown-menu-content][data-state="open"]',
      '[data-slot="dropdown-menu-content"]:not([style*="display: none"])'
    ],
    delay: 10
  });

  // Handle scroll to detect if user is at bottom
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
    setIsAtBottom(atBottom);
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !session?.user?.id) return;

    try {
      await sendMessage(inputValue.trim(), replyingTo?.id);
      setInputValue('');
      setReplyingTo(null);
      stopTyping();
      
      // Focus back to input
      inputRef.current?.focus();
    } catch {
      // Error toast is already handled in the mutation
    }
  };

  // Handle input changes with typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim().length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape' && replyingTo) {
      setReplyingTo(null);
    }
  };

  // Handle message replies
  const handleReply = (message: ChatMessageType) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  // Handle message editing
  const handleEdit = async (messageId: string, content: string) => {
    try {
      await updateMessage(messageId, content);
    } catch (error) {
      // Error toast is already handled in the mutation
      throw error;
    }
  };

  // Handle message deletion
  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      // Error toast is already handled in the mutation
      throw error;
    }
  };

  // Load more messages when scrolling to top
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMoreMessages();
    }
  };

  // Scroll to bottom manually
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!session?.user?.id) {
    return (
      <motion.div 
        ref={chatBoxRef}
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn("fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700", className)}
        aria-modal="true"
        role="dialog"
        tabIndex={0}
        aria-label="Chat box login required"
      >
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Please log in to use chat
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={chatBoxRef}
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn("fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden", className)}
      aria-modal="true"
      role="dialog"
      tabIndex={0}
      aria-label="Project chat box"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-secondary/30 dark:bg-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {projectName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {projectName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {/* Connection status */}
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Online members */}
        {onlineMembers.length > 0 && (
          <div className="mt-3">
            <OnlineMembers 
              onlineMembers={onlineMembers} 
              currentUserId={session.user.id}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="relative h-96">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full"
          onScroll={handleScroll}
        >
          <div className="p-2">
            {/* Load more button */}
            {hasMore && (
              <div className="text-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    'Load more messages'
                  )}
                </Button>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center text-red-500 dark:text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Messages */}
            {messages.length === 0 && !isLoading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-sm">No messages yet.</div>
                <div className="text-xs mt-1">Start the conversation!</div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    currentUserId={session.user.id}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Typing indicator */}
            <TypingIndicator 
              typingUserIds={isTyping} 
              onlineMembers={onlineMembers}
            />

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {!isAtBottom && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 h-8 w-8 p-0 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Reply className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Replying to {replyingTo.user?.name || 'Unknown User'}
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 bg-white dark:bg-gray-800 p-2 rounded border-l-2 border-l-gray-300 dark:border-l-gray-600">
                {replyingTo.content}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="h-6 w-6 p-0 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={replyingTo ? "Reply..." : "Type a message..."}
            disabled={!isConnected}
            className="flex-1 text-sm"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || !isConnected}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
