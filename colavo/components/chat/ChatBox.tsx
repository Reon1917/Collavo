"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Send } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sender?: {
    name: string;
    avatar: string;
  };
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ChatBox({ isOpen, onClose, className }: ChatBoxProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      content: 'Hey, can you check the slides? I finished it!',
      isUser: false,
      timestamp: new Date(),
      sender: {
        name: 'Alex',
        avatar: '/avatars/placeholder-avatar-1.svg'
      }
    },
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      sender: {
        name: 'You',
        avatar: '/avatars/placeholder-avatar-2.svg'
      }
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate response (this would be replaced with actual backend call)
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thanks! See ya later!',
        isUser: false,
        timestamp: new Date(),
        sender: {
          name: 'Alex',
          avatar: '/avatars/placeholder-avatar-1.svg'
        }
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 right-6 w-80 sm:w-96 h-96 bg-background border rounded-lg shadow-lg flex flex-col z-40',
        className
      )}
    >
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center bg-muted/30">
        <h3 className="font-medium">MKT1001 Project</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[80%] p-3 rounded-lg',
              message.isUser
                ? 'bg-primary text-primary-foreground ml-auto'
                : 'bg-muted mr-auto'
            )}
          >
            {message.sender && (
              <div className="flex items-center mb-2">
                <Image
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="ml-2">{message.sender.name}</span>
              </div>
            )}
            <p>{message.content}</p>
            <span className="text-xs opacity-70 block mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 bg-muted/30 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          disabled={!inputValue.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
