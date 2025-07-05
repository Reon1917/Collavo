'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { ChatBox } from './chat-box';

interface ChatButtonProps {
  projectId: string;
  projectName: string;
  className?: string;
}

export function ChatButton({ projectId, projectName, className }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className={`rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700 ${className}`}
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {isOpen && (
        <ChatBox 
          projectId={projectId}
          projectName={projectName}
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}