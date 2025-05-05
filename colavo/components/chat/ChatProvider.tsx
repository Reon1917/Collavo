"use client";

import React, { ReactNode } from 'react';
import { Chat } from './Chat';

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  return (
    <>
      {children}
      <Chat />
    </>
  );
}
