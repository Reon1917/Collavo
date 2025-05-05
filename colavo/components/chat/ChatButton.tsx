"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  onClick: () => void;
  className?: string;
}

export function ChatButton({ onClick, className }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50',
        className
      )}
      aria-label="Open chat"
    >
      <MessageCircle className="text-primary-foreground" />
    </Button>
  );
}
