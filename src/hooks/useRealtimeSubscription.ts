
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UseRealtimeSubscriptionOptions {
  channelName: string;
  table: string;
  filter?: string;
  queryKey: string[];
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useRealtimeSubscription({
  channelName,
  table,
  filter,
  queryKey,
  enabled = true,
  onError
}: UseRealtimeSubscriptionOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;
  const baseRetryDelay = 2000;

  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (channelRef.current && isSubscribedRef.current) {
      console.log(`🧹 Cleaning up channel: ${channelName}`);
      try {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Error cleaning up channel:', error);
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, [channelName]);

  const setupSubscription = useCallback(async () => {
    if (!enabled || !mountedRef.current || isSubscribedRef.current) {
      return;
    }

    // Clean up any existing subscription first
    cleanup();

    try {
      console.log(`🔗 Setting up subscription attempt ${retryCountRef.current + 1}: ${channelName}`);
      
      // Create unique channel name with timestamp to avoid conflicts
      const uniqueChannelName = `${channelName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const channel = supabase.channel(uniqueChannelName, {
        config: {
          broadcast: { self: false },
          presence: { key: uniqueChannelName }
        }
      });
      
      const changeConfig: any = {
        event: '*',
        schema: 'public',
        table: table
      };
      
      if (filter) {
        changeConfig.filter = filter;
      }
      
      channel.on('postgres_changes', changeConfig, (payload) => {
        if (!mountedRef.current) return;
        
        console.log(`📡 Realtime update for ${table}:`, payload);
        queryClient.invalidateQueries({ queryKey });
      });

      channelRef.current = channel;

      const subscribePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Subscription timeout'));
        }, 10000); // 10 second timeout

        channel.subscribe((status, err) => {
          clearTimeout(timeout);
          
          if (!mountedRef.current) {
            resolve(status);
            return;
          }
          
          console.log(`📡 Subscription status for ${channelName}:`, status, err);
          
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
            retryCountRef.current = 0;
            resolve(status);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || err) {
            isSubscribedRef.current = false;
            reject(new Error(err?.message || `Subscription failed with status: ${status}`));
          }
        });
      });

      await subscribePromise;
      console.log(`✅ Successfully subscribed to ${channelName}`);

    } catch (error) {
      console.error(`❌ Error setting up subscription for ${channelName}:`, error);
      isSubscribedRef.current = false;
      
      // Retry logic with exponential backoff
      if (retryCountRef.current < maxRetries && mountedRef.current) {
        retryCountRef.current++;
        const delay = baseRetryDelay * Math.pow(2, retryCountRef.current - 1);
        
        console.log(`🔄 Retrying subscription ${retryCountRef.current}/${maxRetries} for ${channelName} in ${delay}ms`);
        
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setupSubscription();
          }
        }, delay);
      } else {
        console.error(`💥 Max retries exceeded for ${channelName}`);
        if (onError) {
          onError(new Error(`Failed to subscribe to ${channelName} after ${maxRetries} attempts`));
        }
      }
    }
  }, [channelName, table, filter, queryKey, enabled, cleanup, queryClient, onError]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled) {
      // Add small delay to prevent rapid reconnections
      const timer = setTimeout(setupSubscription, 500);
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [setupSubscription, enabled]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    isSubscribed: isSubscribedRef.current,
    retry: setupSubscription,
    cleanup
  };
}
