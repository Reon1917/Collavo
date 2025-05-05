"use client";

import React, { useState } from 'react';
import { ChatButton } from './ChatButton';
import { ChatBox } from './ChatBox';

export function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen(prev => !prev);
  const closeChat = () => setIsChatOpen(false);

  return (
    <>
      <ChatButton onClick={toggleChat} />
      <ChatBox isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
}
