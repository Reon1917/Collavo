# Chat System Refactoring Plan

## Executive Summary

The current chat system suffers from a **685-line monolithic hook** that violates single responsibility principles and makes debugging, testing, and maintenance extremely difficult. This document outlines a comprehensive refactoring plan to transform the system into a modern, maintainable, and scalable chat architecture following [Supabase Realtime best practices](https://supabase.com/docs/guides/realtime/broadcast).

## Current State Analysis

### Problems Identified
- **Massive Hook**: `useProjectChat.ts` (685 lines) handles everything
- **Mixed Concerns**: Messages, presence, typing, real-time subscriptions all intertwined
- **Poor Testability**: Cannot test individual features in isolation
- **Performance Issues**: Unnecessary re-renders and API calls
- **Debugging Nightmare**: Hard to trace issues through complex state management
- **Code Duplication**: Similar patterns repeated across different features

### Architecture Smells
1. Single Responsibility Principle violations
2. Tight coupling between unrelated features
3. No clear separation of concerns
4. Difficult to extend or modify individual features
5. Poor error boundaries and handling

## Target Architecture

### Design Principles
Following [Supabase UI Realtime Chat patterns](https://supabase.com/ui/docs/nextjs/realtime-chat):

1. **Separation of Concerns**: Each hook handles one specific responsibility
2. **Composability**: Hooks can be used independently or together
3. **Testability**: Each hook can be tested in isolation
4. **Performance**: Optimized subscriptions and state management
5. **Scalability**: Easy to add new chat features
6. **Maintainability**: Clear file structure and dependencies

### Core Architecture Components

```
hooks/
├── chat/
│   ├── core/
│   │   ├── useChatMessages.ts          # Message CRUD & pagination
│   │   ├── useChatMutations.ts         # Send, update, delete operations
│   │   ├── usePresence.ts              # User presence tracking
│   │   ├── useTypingIndicator.ts       # Typing indicators
│   │   └── useRealTimeSubscriptions.ts # Supabase subscriptions
│   ├── composites/
│   │   ├── useProjectChat.ts           # Main orchestrator (80 lines)
│   │   └── useChatRoom.ts              # Room-specific logic
│   └── utils/
│       ├── chatHelpers.ts              # Utility functions
│       ├── messageTransformers.ts      # Data transformation
│       └── subscriptionManager.ts      # Subscription lifecycle
```

## Refactoring Phases

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Create Base Types and Utilities

**File: `types/chat.ts`**
```typescript
// Enhanced chat types based on Supabase patterns
export interface ChatMessage {
  id: string
  content: string
  user: {
    id: string
    name: string
    image?: string
  }
  createdAt: string
  updatedAt?: string
  replyTo?: string
  isEdited?: boolean
  editedAt?: string
}

export interface ChatRoom {
  id: string
  name: string
  projectId: string
  lastMessage?: ChatMessage
  unreadCount: number
}

export interface UserPresence {
  userId: string
  user: {
    id: string
    name: string
    image?: string
  }
  isOnline: boolean
  lastSeen: string
  status?: 'online' | 'away' | 'busy'
}

export interface TypingIndicator {
  userId: string
  userName: string
  isTyping: boolean
  timestamp: string
}
```

**File: `hooks/chat/utils/chatHelpers.ts`**
```typescript
import { ChatMessage, UserPresence } from '@/types/chat'

export const isDev = process.env.NODE_ENV === 'development'

export function logChat(message: string, data?: any) {
  if (isDev) {
    console.log(`[Chat] ${message}`, data)
  }
}

export function logPresence(message: string, data?: any) {
  if (isDev) {
    console.log(`[Presence] ${message}`, data)
  }
}

export function logRealTime(message: string, data?: any) {
  if (isDev) {
    console.log(`[RealTime] ${message}`, data)
  }
}

export function shouldShowMessageHeader(
  currentMessage: ChatMessage, 
  previousMessage?: ChatMessage
): boolean {
  if (!previousMessage) return true
  if (currentMessage.user.id !== previousMessage.user.id) return true
  
  const timeDiff = new Date(currentMessage.createdAt).getTime() - 
                   new Date(previousMessage.createdAt).getTime()
  return timeDiff > 5 * 60 * 1000 // 5 minutes
}

export function groupMessagesByDate(messages: ChatMessage[]) {
  return messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {} as Record<string, ChatMessage[]>)
}
```

#### 1.2 Create Subscription Manager

**File: `hooks/chat/utils/subscriptionManager.ts`**
```typescript
import { supabase } from '@/lib/supabase'
import { logRealTime } from './chatHelpers'

export class SubscriptionManager {
  private subscriptions = new Map<string, any>()
  
  createChannel(channelName: string, config?: any) {
    logRealTime(`Creating channel: ${channelName}`)
    const channel = supabase.channel(channelName, config)
    this.subscriptions.set(channelName, channel)
    return channel
  }
  
  removeChannel(channelName: string) {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      logRealTime(`Removing channel: ${channelName}`)
      supabase.removeChannel(channel)
      this.subscriptions.delete(channelName)
    }
  }
  
  removeAllChannels() {
    logRealTime(`Cleaning up ${this.subscriptions.size} channels`)
    this.subscriptions.forEach((channel, name) => {
      supabase.removeChannel(channel)
    })
    this.subscriptions.clear()
  }
  
  getChannel(channelName: string) {
    return this.subscriptions.get(channelName)
  }
}

export const subscriptionManager = new SubscriptionManager()
```

### Phase 2: Core Hook Extraction (Week 2)

#### 2.1 Extract Message Management

**File: `hooks/chat/core/useChatMessages.ts`**
```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChatMessage } from '@/types/chat'
import { logChat } from '../utils/chatHelpers'

interface UseChatMessagesOptions {
  enabled?: boolean
  pageSize?: number
  staleTime?: number
}

interface UseChatMessagesReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMoreMessages: () => Promise<void>
  refetchMessages: () => void
}

export function useChatMessages(
  projectId: string, 
  options: UseChatMessagesOptions = {}
): UseChatMessagesReturn {
  const { enabled = true, pageSize = 50, staleTime = 30000 } = options
  const queryClient = useQueryClient()

  const {
    data: messagesData,
    error: messagesError,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['chat-messages', projectId],
    queryFn: async (): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
      logChat(`Fetching messages for project: ${projectId}`)
      
      const response = await fetch(`/api/projects/${projectId}/chat?limit=${pageSize}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      const data = await response.json()
      logChat(`Fetched ${data.messages.length} messages`)
      
      return { messages: data.messages, hasMore: data.hasMore }
    },
    enabled: enabled && !!projectId,
    staleTime,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })

  const loadMoreMessages = async () => {
    // TODO: Implement pagination logic
    logChat('Loading more messages...')
  }

  const refetchMessages = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['chat-messages', projectId],
      refetchType: 'active'
    })
  }

  return {
    messages: messagesData?.messages || [],
    isLoading,
    error: messagesError?.message || null,
    hasMore: messagesData?.hasMore || false,
    loadMoreMessages,
    refetchMessages,
  }
}
```

#### 2.2 Extract Mutation Operations

**File: `hooks/chat/core/useChatMutations.ts`**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChatMessage, CreateChatMessageData } from '@/types/chat'
import { logChat } from '../utils/chatHelpers'

interface UseChatMutationsReturn {
  sendMessage: (content: string, replyTo?: string) => Promise<void>
  updateMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  isSending: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export function useChatMutations(projectId: string): UseChatMutationsReturn {
  const queryClient = useQueryClient()

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, replyTo }: { content: string; replyTo?: string }) => {
      logChat('Sending message...')
      
      const messageData: CreateChatMessageData = {
        content: content.trim(),
        replyTo: replyTo || null
      }

      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      return response.json()
    },
    onSuccess: () => {
      logChat('Message sent successfully')
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      logChat(`Updating message: ${messageId}`)
      
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update message')
      }

      return response.json()
    },
    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({ queryKey: ['chat-messages', projectId] })
      
      const previousMessages = queryClient.getQueryData(['chat-messages', projectId])
      
      queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
        if (!old) return old
        
        return {
          ...old,
          messages: old.messages.map((msg: ChatMessage) => 
            msg.id === messageId
              ? { 
                  ...msg, 
                  content: content.trim(),
                  isEdited: true,
                  editedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              : msg
          )
        }
      })

      return { previousMessages }
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', projectId], context.previousMessages)
      }
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', projectId],
        refetchType: 'active'
      })
    },
  })

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      logChat(`Deleting message: ${messageId}`)
      
      const response = await fetch(`/api/projects/${projectId}/chat/${messageId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete message')
      }

      return response.json()
    },
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['chat-messages', projectId] })
      
      const previousMessages = queryClient.getQueryData(['chat-messages', projectId])
      
      queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
        if (!old) return old
        
        return {
          ...old,
          messages: old.messages.filter((msg: ChatMessage) => msg.id !== messageId)
        }
      })

      return { previousMessages }
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', projectId], context.previousMessages)
      }
      toast.error(error.message)
    },
  })

  return {
    sendMessage: async (content: string, replyTo?: string) => {
      await sendMessageMutation.mutateAsync({ content, replyTo })
    },
    updateMessage: async (messageId: string, content: string) => {
      await updateMessageMutation.mutateAsync({ messageId, content })
    },
    deleteMessage: async (messageId: string) => {
      await deleteMessageMutation.mutateAsync(messageId)
    },
    isSending: sendMessageMutation.isPending,
    isUpdating: updateMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
  }
}
```

#### 2.3 Extract Presence Management

**File: `hooks/chat/core/usePresence.ts`**
```typescript
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPresence } from '@/types/chat'
import { logPresence } from '../utils/chatHelpers'

interface UsePresenceReturn {
  onlineMembers: UserPresence[]
  isOnline: boolean
  updatePresence: (isOnline: boolean) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function usePresence(
  projectId: string, 
  currentUserId: string,
  enabled: boolean = true
): UsePresenceReturn {
  const [isOnline, setIsOnline] = useState(false)
  const queryClient = useQueryClient()

  // Fetch online members
  const {
    data: onlineMembers = [],
    error: presenceError,
    isLoading
  } = useQuery({
    queryKey: ['chat-presence', projectId],
    queryFn: async (): Promise<UserPresence[]> => {
      const response = await fetch(`/api/projects/${projectId}/presence`)
      if (!response.ok) {
        throw new Error('Failed to fetch presence')
      }
      
      const data = await response.json()
      logPresence(`Fetched ${data.onlineMembers?.length || 0} online members`)
      
      return data.onlineMembers || []
    },
    enabled: enabled && !!projectId && !!currentUserId,
    staleTime: 60000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })

  // Update presence mutation
  const updatePresenceMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      logPresence(`Updating presence to: ${isOnline ? 'online' : 'offline'}`)
      
      const response = await fetch(`/api/projects/${projectId}/presence`, {
        method: isOnline ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline })
      })

      if (!response.ok) {
        throw new Error('Failed to update presence')
      }

      return response.json()
    },
    onSuccess: (data, isOnlineParam) => {
      setIsOnline(isOnlineParam)
      
      // Update cache immediately
      if (isOnlineParam && data) {
        queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
          const filtered = old.filter(member => member.userId !== currentUserId)
          return [...filtered, data]
        })
      } else if (!isOnlineParam) {
        queryClient.setQueryData(['chat-presence', projectId], (old: UserPresence[] = []) => {
          return old.filter(member => member.userId !== currentUserId)
        })
      }
    },
    onError: (error) => {
      logPresence(`Failed to update presence: ${error.message}`)
    },
  })

  const updatePresence = useCallback(async (online: boolean) => {
    await updatePresenceMutation.mutateAsync(online)
  }, [updatePresenceMutation])

  return {
    onlineMembers,
    isOnline,
    updatePresence,
    isLoading,
    error: presenceError?.message || null,
  }
}
```

#### 2.4 Extract Typing Indicators

**File: `hooks/chat/core/useTypingIndicator.ts`**
```typescript
import { useState, useCallback, useRef } from 'react'
import { TypingIndicator } from '@/types/chat'
import { logPresence } from '../utils/chatHelpers'

interface UseTypingIndicatorReturn {
  startTyping: () => void
  stopTyping: () => void
  isTyping: string[]
  setTypingUsers: (users: string[]) => void
}

export function useTypingIndicator(
  projectId: string,
  currentUserId: string,
  presenceChannel: any,
  enabled: boolean = true
): UseTypingIndicatorReturn {
  const [isTyping, setIsTyping] = useState<string[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startTyping = useCallback(() => {
    if (!enabled || !currentUserId || !projectId || !presenceChannel) {
      return
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing start event using Supabase Broadcast
    presenceChannel.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        userId: currentUserId,
        projectId,
        timestamp: new Date().toISOString()
      }
    })

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [currentUserId, projectId, enabled, presenceChannel])

  const stopTyping = useCallback(() => {
    if (!enabled || !currentUserId || !projectId || !presenceChannel) {
      return
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    // Send typing stop event using Supabase Broadcast
    presenceChannel.send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        userId: currentUserId,
        projectId,
        timestamp: new Date().toISOString()
      }
    })
  }, [currentUserId, projectId, enabled, presenceChannel])

  const setTypingUsers = useCallback((users: string[]) => {
    setIsTyping(users)
  }, [])

  return {
    startTyping,
    stopTyping,
    isTyping,
    setTypingUsers,
  }
}
```

#### 2.5 Extract Real-time Subscriptions

**File: `hooks/chat/core/useRealTimeSubscriptions.ts`**
```typescript
import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChatMessage } from '@/types/chat'
import { subscriptionManager } from '../utils/subscriptionManager'
import { logRealTime } from '../utils/chatHelpers'

interface UseRealTimeSubscriptionsOptions {
  onTypingStart?: (userId: string) => void
  onTypingStop?: (userId: string) => void
  onPresenceChange?: () => void
}

interface UseRealTimeSubscriptionsReturn {
  isConnected: boolean
  messageChannel: any
  presenceChannel: any
}

export function useRealTimeSubscriptions(
  projectId: string,
  currentUserId: string,
  enabled: boolean = true,
  options: UseRealTimeSubscriptionsOptions = {}
): UseRealTimeSubscriptionsReturn {
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const mountedRef = useRef(true)
  const messageChannelRef = useRef<any>(null)
  const presenceChannelRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled || !projectId || !currentUserId) return

    logRealTime(`Setting up subscriptions for project: ${projectId}`)
    mountedRef.current = true

    // Set up message subscription using Postgres Changes
    const messageChannel = subscriptionManager.createChannel(`project_${projectId}_messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (!mountedRef.current) return
          logRealTime('New message received')
          
          queryClient.invalidateQueries({ 
            queryKey: ['chat-messages', projectId],
            refetchType: 'active'
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (!mountedRef.current) return
          logRealTime('Message updated')
          
          queryClient.invalidateQueries({ 
            queryKey: ['chat-messages', projectId],
            refetchType: 'active'
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (!mountedRef.current) return
          logRealTime('Message deleted')
          
          // Optimistically update cache
          queryClient.setQueryData(['chat-messages', projectId], (old: any) => {
            if (!old) return old
            
            const deletedId = payload.old?.id
            if (!deletedId) return old
            
            return {
              ...old,
              messages: old.messages.filter((msg: ChatMessage) => msg.id !== deletedId)
            }
          })
        }
      )
      .subscribe((status) => {
        logRealTime(`Message channel: ${status}`)
        setIsConnected(status === 'SUBSCRIBED')
      })

    messageChannelRef.current = messageChannel

    // Set up presence and typing subscription using Presence + Broadcast
    const presenceChannel = subscriptionManager.createChannel(`project_${projectId}_presence`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (!mountedRef.current) return
          logRealTime('Presence changed')
          
          // Refresh presence data
          queryClient.invalidateQueries({ 
            queryKey: ['chat-presence', projectId],
            refetchType: 'active'
          })
          
          options.onPresenceChange?.()
        }
      )
      .on('broadcast', { event: 'typing_start' }, ({ payload }) => {
        if (!mountedRef.current || payload.userId === currentUserId) return
        logRealTime(`User started typing: ${payload.userId}`)
        options.onTypingStart?.(payload.userId)
      })
      .on('broadcast', { event: 'typing_stop' }, ({ payload }) => {
        if (!mountedRef.current || payload.userId === currentUserId) return
        logRealTime(`User stopped typing: ${payload.userId}`)
        options.onTypingStop?.(payload.userId)
      })
      .subscribe()

    presenceChannelRef.current = presenceChannel

    // Cleanup function
    return () => {
      mountedRef.current = false
      subscriptionManager.removeChannel(`project_${projectId}_messages`)
      subscriptionManager.removeChannel(`project_${projectId}_presence`)
    }
  }, [projectId, currentUserId, enabled, queryClient, options])

  return {
    isConnected,
    messageChannel: messageChannelRef.current,
    presenceChannel: presenceChannelRef.current,
  }
}
```

### Phase 3: Create Orchestrator Hook (Week 3)

#### 3.1 Main Chat Hook

**File: `hooks/chat/composites/useProjectChat.ts`**
```typescript
import { useCallback, useEffect, useRef } from 'react'
import { useChatMessages } from '../core/useChatMessages'
import { useChatMutations } from '../core/useChatMutations'
import { usePresence } from '../core/usePresence'
import { useTypingIndicator } from '../core/useTypingIndicator'
import { useRealTimeSubscriptions } from '../core/useRealTimeSubscriptions'
import { useUserActivity } from '@/hooks/useUserActivity'

interface UseChatOptions {
  enabled?: boolean
  pageSize?: number
}

interface UseProjectChatReturn {
  // Messages
  messages: ChatMessage[]
  isLoading: boolean
  hasMore: boolean
  loadMoreMessages: () => Promise<void>
  
  // Mutations
  sendMessage: (content: string, replyTo?: string) => Promise<void>
  updateMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  isSending: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Presence
  onlineMembers: UserPresence[]
  isOnline: boolean
  
  // Typing
  startTyping: () => void
  stopTyping: () => void
  isTyping: string[]
  
  // Connection
  isConnected: boolean
  error?: string | null
}

export function useProjectChat(
  projectId: string,
  currentUserId: string,
  options: UseChatOptions = {}
): UseProjectChatReturn {
  const { enabled = true, pageSize = 50 } = options
  const lastPresenceUpdateRef = useRef<Date | null>(null)

  // Core hooks
  const messages = useChatMessages(projectId, { enabled, pageSize })
  const mutations = useChatMutations(projectId)
  const presence = usePresence(projectId, currentUserId, enabled)
  
  // Real-time subscriptions
  const realtime = useRealTimeSubscriptions(
    projectId, 
    currentUserId, 
    enabled,
    {
      onTypingStart: (userId) => typing.setTypingUsers([...typing.isTyping, userId]),
      onTypingStop: (userId) => typing.setTypingUsers(typing.isTyping.filter(id => id !== userId)),
      onPresenceChange: () => {
        // Refresh presence data when changes occur
      }
    }
  )
  
  // Typing indicators
  const typing = useTypingIndicator(
    projectId, 
    currentUserId, 
    realtime.presenceChannel, 
    enabled
  )

  // Enhanced activity detection for presence
  const handleUserActivity = useCallback(() => {
    const now = new Date()
    const lastUpdate = lastPresenceUpdateRef.current
    
    // Only update if more than 10 seconds have passed
    if (!lastUpdate || now.getTime() - lastUpdate.getTime() > 10000) {
      lastPresenceUpdateRef.current = now
      presence.updatePresence(true)
    }
  }, [presence])

  // Use activity detection hook
  useUserActivity({
    onActivity: handleUserActivity,
    debounceMs: 1000,
  })

  // Handle page visibility changes
  useEffect(() => {
    if (!enabled || !projectId) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        presence.updatePresence(false)
      } else {
        lastPresenceUpdateRef.current = new Date()
        presence.updatePresence(true)
      }
    }

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability when page is unloading
      navigator.sendBeacon(
        `/api/projects/${projectId}/presence`,
        JSON.stringify({ isOnline: false })
      )
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, projectId, presence])

  // Set initial presence
  useEffect(() => {
    if (enabled && projectId && currentUserId) {
      presence.updatePresence(true)
    }
  }, [enabled, projectId, currentUserId, presence])

  return {
    // Messages
    messages: messages.messages,
    isLoading: messages.isLoading,
    hasMore: messages.hasMore,
    loadMoreMessages: messages.loadMoreMessages,
    
    // Mutations
    sendMessage: mutations.sendMessage,
    updateMessage: mutations.updateMessage,
    deleteMessage: mutations.deleteMessage,
    isSending: mutations.isSending,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting,
    
    // Presence
    onlineMembers: presence.onlineMembers,
    isOnline: presence.isOnline,
    
    // Typing
    startTyping: typing.startTyping,
    stopTyping: typing.stopTyping,
    isTyping: typing.isTyping,
    
    // Connection
    isConnected: realtime.isConnected,
    error: messages.error || presence.error,
  }
}
```

### Phase 4: Component Refactoring (Week 4)

#### 4.1 Enhanced Chat Components

**File: `components/chat/ChatProvider.tsx`**
```typescript
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useProjectChat } from '@/hooks/chat/composites/useProjectChat'
import type { UseProjectChatReturn } from '@/hooks/chat/composites/useProjectChat'

const ChatContext = createContext<UseProjectChatReturn | null>(null)

interface ChatProviderProps {
  projectId: string
  currentUserId: string
  children: ReactNode
}

export function ChatProvider({ projectId, currentUserId, children }: ChatProviderProps) {
  const chat = useProjectChat(projectId, currentUserId)
  
  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
```

**File: `components/chat/MessageList.tsx`**
```typescript
'use client'

import { memo, useEffect, useRef } from 'react'
import { ChatMessageItem } from './ChatMessageItem'
import { useChatContext } from './ChatProvider'
import { shouldShowMessageHeader, groupMessagesByDate } from '@/hooks/chat/utils/chatHelpers'

interface MessageListProps {
  className?: string
}

export const MessageList = memo(function MessageList({ className }: MessageListProps) {
  const { messages, isLoading, loadMoreMessages, hasMore } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const groupedMessages = groupMessagesByDate(messages)

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  return (
    <div 
      ref={scrollAreaRef}
      className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}
    >
      {/* Load more button */}
      {hasMore && (
        <button
          onClick={loadMoreMessages}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Load more messages
        </button>
      )}

      {/* Grouped messages by date */}
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
          <div className="flex justify-center py-2">
            <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
          
          {dayMessages.map((message, index) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              showHeader={shouldShowMessageHeader(message, dayMessages[index - 1])}
            />
          ))}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  )
})
```

**File: `components/chat/MessageInput.tsx`**
```typescript
'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatContext } from './ChatProvider'
import { TypingIndicator } from './TypingIndicator'

interface MessageInputProps {
  placeholder?: string
  maxLength?: number
}

export function MessageInput({ 
  placeholder = "Type a message...", 
  maxLength = 4000 
}: MessageInputProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const { sendMessage, startTyping, stopTyping, isSending } = useChatContext()

  const handleSubmit = async () => {
    if (!input.trim() || isSending) return

    const message = input.trim()
    setInput('')
    stopTyping()
    setIsTyping(false)

    try {
      await sendMessage(message)
    } catch (error) {
      // Error is handled by the mutation
      setInput(message) // Restore message on error
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      startTyping()
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
      stopTyping()
    }
  }

  const handleBlur = () => {
    if (isTyping) {
      setIsTyping(false)
      stopTyping()
    }
  }

  return (
    <div className="border-t p-4 space-y-2">
      <TypingIndicator />
      
      <div className="flex gap-2">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="min-h-[40px] max-h-[120px] resize-none"
          maxLength={maxLength}
          disabled={isSending}
        />
        
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isSending}
          size="sm"
        >
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </div>
      
      {input.length > maxLength * 0.8 && (
        <div className="text-xs text-muted-foreground text-right">
          {input.length}/{maxLength}
        </div>
      )}
    </div>
  )
}
```

### Phase 5: Testing & Optimization (Week 5)

#### 5.1 Unit Tests

**File: `hooks/chat/__tests__/useChatMessages.test.ts`**
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useChatMessages } from '../core/useChatMessages'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useChatMessages', () => {
  it('should fetch messages successfully', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        messages: [
          { id: '1', content: 'Hello', user: { name: 'John' }, createdAt: new Date().toISOString() }
        ],
        hasMore: false
      })
    })

    const { result } = renderHook(
      () => useChatMessages('project-1'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Hello')
  })
})
```

## Migration Strategy

### Backward Compatibility
1. Keep existing `useProjectChat` as a wrapper during migration
2. Gradually migrate components to use new hooks
3. Feature flag new implementation for testing

### Performance Improvements
- **85% reduction** in main hook size (685 → 80 lines)
- **Reduced re-renders** through focused state management
- **Better caching** with independent query keys
- **Optimized subscriptions** using Supabase best practices

### Monitoring & Rollback Plan
1. Monitor error rates and performance metrics
2. A/B test new implementation with subset of users
3. Gradual rollout with quick rollback capability
4. Comprehensive logging for debugging

## Success Metrics

### Code Quality
- [ ] Main hook reduced from 685 to ~80 lines
- [ ] 100% test coverage for core hooks
- [ ] Zero TypeScript errors
- [ ] ESLint warnings eliminated

### Performance
- [ ] 50% reduction in React re-renders
- [ ] 30% improvement in chat loading time
- [ ] Reduced memory usage from optimized subscriptions
- [ ] Better Core Web Vitals scores

### Developer Experience
- [ ] Individual hooks testable in isolation
- [ ] Clear separation of concerns
- [ ] Easy to add new chat features
- [ ] Simplified debugging and maintenance

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| 1 | Week 1 | Foundation types, utilities, and subscription manager |
| 2 | Week 2 | Core hooks extraction (messages, mutations, presence, typing, real-time) |
| 3 | Week 3 | Orchestrator hook and component updates |
| 4 | Week 4 | Enhanced components with Context API |
| 5 | Week 5 | Testing, optimization, and migration |

**Total Estimated Effort**: 5 weeks with 1-2 developers

This refactoring plan transforms a monolithic 685-line hook into a maintainable, testable, and scalable chat system following Supabase best practices and modern React patterns. 