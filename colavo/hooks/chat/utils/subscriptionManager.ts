/**
 * Supabase Subscription Manager
 * 
 * This utility class manages Supabase real-time subscriptions for the chat system.
 * It provides centralized channel management, connection tracking, and cleanup.
 */

import { supabase } from '@/lib/supabase';
import { logRealTime, logError } from './chatHelpers';
import { SubscriptionStatus, RealTimeEvent, RealTimeEventType } from '@/types/chat';

// ========================================================================================
// Subscription Manager Class
// ========================================================================================

export class SubscriptionManager {
  private subscriptions = new Map<string, any>();
  private connectionStatus: SubscriptionStatus = 'disconnected';
  private statusCallbacks = new Set<(status: SubscriptionStatus) => void>();
  private errorCallbacks = new Set<(error: Error) => void>();
  private eventCallbacks = new Map<string, Set<(event: RealTimeEvent) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor() {
    this.startHeartbeat();
  }

  // ========================================================================================
  // Connection Management
  // ========================================================================================

  /**
   * Get current connection status
   */
  getConnectionStatus(): SubscriptionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if manager is connected
   */
  isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: (status: SubscriptionStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to errors
   */
  onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.add(callback);
    
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  /**
   * Update connection status and notify callbacks
   */
  private updateConnectionStatus(status: SubscriptionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      logRealTime(`Connection status changed to: ${status}`);
      
      // Notify all status callbacks
      this.statusCallbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          logError('Error in status callback', error);
        }
      });
    }
  }

  /**
   * Emit error to all error callbacks
   */
  private emitError(error: Error): void {
    logError('Subscription manager error', error);
    
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        logError('Error in error callback', callbackError);
      }
    });
  }

  // ========================================================================================
  // Channel Management
  // ========================================================================================

  /**
   * Create a new Supabase channel
   */
  createChannel(channelName: string, config?: any): any {
    if (this.isDestroyed) {
      throw new Error('SubscriptionManager has been destroyed');
    }

    // Remove existing channel if it exists
    this.removeChannel(channelName);

    logRealTime(`Creating channel: ${channelName}`);
    
    try {
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: 'user_id',
          },
          ...config
        }
      });

      // Store channel reference
      this.subscriptions.set(channelName, channel);
      
      // Track connection status for this channel
      this.setupChannelStatusTracking(channel, channelName);
      
      return channel;
    } catch (error) {
      const err = new Error(`Failed to create channel ${channelName}: ${error}`);
      this.emitError(err);
      throw err;
    }
  }

  /**
   * Get an existing channel
   */
  getChannel(channelName: string): any {
    return this.subscriptions.get(channelName);
  }

  /**
   * Check if a channel exists
   */
  hasChannel(channelName: string): boolean {
    return this.subscriptions.has(channelName);
  }

  /**
   * Remove a specific channel
   */
  removeChannel(channelName: string): void {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      logRealTime(`Removing channel: ${channelName}`);
      
      try {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
        this.eventCallbacks.delete(channelName);
      } catch (error) {
        logError(`Error removing channel ${channelName}`, error);
      }
    }
  }

  /**
   * Remove all channels
   */
  removeAllChannels(): void {
    logRealTime(`Cleaning up ${this.subscriptions.size} channels`);
    
    this.subscriptions.forEach((channel, channelName) => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        logError(`Error removing channel ${channelName}`, error);
      }
    });
    
    this.subscriptions.clear();
    this.eventCallbacks.clear();
  }

  /**
   * Get list of all channel names
   */
  getChannelNames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get number of active channels
   */
  getChannelCount(): number {
    return this.subscriptions.size;
  }

  // ========================================================================================
  // Event Management
  // ========================================================================================

  /**
   * Subscribe to events from a specific channel
   */
  subscribeToChannelEvents(
    channelName: string, 
    callback: (event: RealTimeEvent) => void
  ): () => void {
    if (!this.eventCallbacks.has(channelName)) {
      this.eventCallbacks.set(channelName, new Set());
    }
    
    this.eventCallbacks.get(channelName)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(channelName);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventCallbacks.delete(channelName);
        }
      }
    };
  }

  /**
   * Emit event to channel subscribers
   */
  private emitChannelEvent(channelName: string, event: RealTimeEvent): void {
    const callbacks = this.eventCallbacks.get(channelName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logError(`Error in channel event callback for ${channelName}`, error);
        }
      });
    }
  }

  // ========================================================================================
  // Channel Status Tracking
  // ========================================================================================

  /**
   * Setup status tracking for a channel
   */
  private setupChannelStatusTracking(channel: any, channelName: string): void {
    // Track subscription status
    const originalSubscribe = channel.subscribe.bind(channel);
    channel.subscribe = (callback?: (status: string) => void) => {
      return originalSubscribe((status: string) => {
        logRealTime(`Channel ${channelName} status: ${status}`);
        
        // Update overall connection status
        this.updateOverallConnectionStatus();
        
        // Call original callback if provided
        if (callback) {
          callback(status);
        }
      });
    };
  }

  /**
   * Update overall connection status based on all channels
   */
  private updateOverallConnectionStatus(): void {
    const channels = Array.from(this.subscriptions.values());
    
    if (channels.length === 0) {
      this.updateConnectionStatus('disconnected');
      return;
    }

    // Check if any channels are connected
    const hasConnectedChannels = channels.some(channel => {
      // Note: Supabase doesn't expose channel status directly
      // This is a simplified check - in practice, you might need
      // to track status per channel
      return true; // Assume connected for now
    });

    this.updateConnectionStatus(hasConnectedChannels ? 'connected' : 'disconnected');
  }

  // ========================================================================================
  // Reconnection Logic
  // ========================================================================================

  /**
   * Attempt to reconnect all channels
   */
  async reconnect(): Promise<void> {
    if (this.isDestroyed) return;

    this.updateConnectionStatus('connecting');
    logRealTime(`Reconnecting... (attempt ${this.reconnectAttempts + 1})`);

    try {
      // Get list of channels to reconnect
      const channelNames = this.getChannelNames();
      
      // Remove all channels
      this.removeAllChannels();
      
      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
      
      // Recreate channels (this would need to be handled by the calling code
      // since we don't store the channel configurations)
      logRealTime('Channels removed, ready for recreation');
      
      this.reconnectAttempts = 0; // Reset on successful reconnect
      
    } catch (error) {
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        logRealTime(`Reconnection failed, retrying in ${delay}ms`);
        
        setTimeout(() => {
          if (!this.isDestroyed) {
            this.reconnect();
          }
        }, delay);
      } else {
        this.updateConnectionStatus('error');
        this.emitError(new Error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`));
      }
    }
  }

  // ========================================================================================
  // Heartbeat & Health Monitoring
  // ========================================================================================

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isDestroyed) return;
      
      this.checkConnectionHealth();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Check connection health
   */
  private checkConnectionHealth(): void {
    // Simple health check - in a real implementation,
    // you might want to ping the server or check channel status
    if (this.subscriptions.size === 0) {
      this.updateConnectionStatus('disconnected');
    }
  }

  // ========================================================================================
  // Utility Methods
  // ========================================================================================

  /**
   * Get subscription statistics
   */
  getStats(): {
    channelCount: number;
    connectionStatus: SubscriptionStatus;
    reconnectAttempts: number;
    channelNames: string[];
  } {
    return {
      channelCount: this.getChannelCount(),
      connectionStatus: this.getConnectionStatus(),
      reconnectAttempts: this.reconnectAttempts,
      channelNames: this.getChannelNames(),
    };
  }

  /**
   * Reset reconnection attempts
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  /**
   * Destroy the subscription manager
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    logRealTime('Destroying subscription manager');
    
    this.isDestroyed = true;
    this.stopHeartbeat();
    this.removeAllChannels();
    this.statusCallbacks.clear();
    this.errorCallbacks.clear();
    this.eventCallbacks.clear();
    
    this.updateConnectionStatus('disconnected');
  }

  /**
   * Check if the manager has been destroyed
   */
  isManagerDestroyed(): boolean {
    return this.isDestroyed;
  }
}

// ========================================================================================
// Singleton Instance
// ========================================================================================

/**
 * Global subscription manager instance
 * This ensures we have a single point of connection management across the app
 */
export const subscriptionManager = new SubscriptionManager();

// ========================================================================================
// Helper Functions
// ========================================================================================

/**
 * Create a channel with automatic cleanup
 */
export function createManagedChannel(
  channelName: string,
  config?: any
): {
  channel: any;
  cleanup: () => void;
} {
  const channel = subscriptionManager.createChannel(channelName, config);
  
  const cleanup = () => {
    subscriptionManager.removeChannel(channelName);
  };
  
  return { channel, cleanup };
}

/**
 * Subscribe to multiple channels with automatic cleanup
 */
export function createMultiChannelSubscription(
  channels: { name: string; config?: any }[]
): {
  channels: Record<string, any>;
  cleanup: () => void;
} {
  const createdChannels: Record<string, any> = {};
  
  channels.forEach(({ name, config }) => {
    createdChannels[name] = subscriptionManager.createChannel(name, config);
  });
  
  const cleanup = () => {
    Object.keys(createdChannels).forEach(channelName => {
      subscriptionManager.removeChannel(channelName);
    });
  };
  
  return { channels: createdChannels, cleanup };
}

/**
 * Get connection status across all channels
 */
export function getGlobalConnectionStatus(): SubscriptionStatus {
  return subscriptionManager.getConnectionStatus();
}

/**
 * Subscribe to global connection status changes
 */
export function subscribeToConnectionStatus(
  callback: (status: SubscriptionStatus) => void
): () => void {
  return subscriptionManager.onStatusChange(callback);
}

/**
 * Subscribe to global errors
 */
export function subscribeToGlobalErrors(
  callback: (error: Error) => void
): () => void {
  return subscriptionManager.onError(callback);
}

/**
 * Manually trigger reconnection
 */
export function reconnectAll(): Promise<void> {
  return subscriptionManager.reconnect();
}

/**
 * Get subscription manager statistics
 */
export function getSubscriptionStats(): ReturnType<SubscriptionManager['getStats']> {
  return subscriptionManager.getStats();
}

// ========================================================================================
// Cleanup on Page Unload
// ========================================================================================

// Ensure cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.destroy();
  });
  
  // Also cleanup on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User has switched tabs/minimized - could implement connection pausing here
      logRealTime('Page hidden, connection might be paused');
    } else {
      // User is back - ensure connections are healthy
      logRealTime('Page visible, checking connection health');
    }
  });
}

export default subscriptionManager;