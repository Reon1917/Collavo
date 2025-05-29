'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';

type ChatMessage = {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
};

type ChatBoxProps = {
  onClose: () => void;
};

export function ChatBox({ onClose }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: {
        name: 'Alex Chen',
        avatar: '/avatars/team-1.png', // You'll need to add these avatar images
      },
      content: 'I finished the slides pls check',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isCurrentUser: false,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: {
        name: 'You',
        avatar: '/avatars/user.png', // You'll need to add this avatar image
      },
      content: inputValue,
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // Simulate teammate response after a short delay if this is the first user message
    if (messages.length === 1) {
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: {
            name: 'Alex Chen',
            avatar: '/avatars/team-1.png',
          },
          content: 'alright thanks see ya later',
          timestamp: new Date(),
          isCurrentUser: false,
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            P
          </div>
          <h3 className="font-semibold">Project Name</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 h-96 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0">
                    {message.sender.avatar ? (
                      <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
                        {/* Replace with actual Image component when you have the avatars */}
                        <div className="h-full w-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {message.sender.name.charAt(0)}
                        </div>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {message.sender.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div 
                      className={`p-3 rounded-lg ${message.isCurrentUser 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 rounded-bl-none'}`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === ''}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
