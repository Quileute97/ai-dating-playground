
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
  const maxRetries = 3;

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log(`🧹 Cleaning up channel: ${channelName}`);
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, [channelName]);

  const setupSubscription = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    
    // Prevent multiple subscriptions
    if (isSubscribedRef.current) {
      console.log(`⚠️ Already subscribed to ${channelName}, skipping`);
      return;
    }

    cleanup();

    try {
      console.log(`🔗 Setting up subscription: ${channelName}`);
      
      const uniqueChannelName = `${channelName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      let channelBuilder = supabase.channel(uniqueChannelName);
      
      const changeConfig: any = {
        event: '*',
        schema: 'public',
        table: table
      };
      
      if (filter) {
        changeConfig.filter = filter;
      }
      
      channelBuilder = channelBuilder.on('postgres_changes', changeConfig, (payload) => {
        if (!mountedRef.current) return;
        
        console.log(`📡 Realtime update for ${table}:`, payload);
        queryClient.invalidateQueries({ queryKey });
      });

      const channel = channelBuilder.subscribe((status) => {
        if (!mountedRef.current) return;
        
        console.log(`📡 Subscription status for ${channelName}:`, status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          retryCountRef.current = 0;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isSubscribedRef.current = false;
          
          // Retry logic
          if (retryCountRef.current < maxRetries && mountedRef.current) {
            retryCountRef.current++;
            console.log(`🔄 Retrying subscription ${retryCountRef.current}/${maxRetries} for ${channelName}`);
            setTimeout(() => {
              if (mountedRef.current) {
                setupSubscription();
              }
            }, 1000 * retryCountRef.current);
          } else if (onError) {
            onError(new Error(`Failed to subscribe to ${channelName} after ${maxRetries} attempts`));
          }
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error(`❌ Error setting up subscription for ${channelName}:`, error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [channelName, table, filter, queryKey, enabled, cleanup, queryClient, onError]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled) {
      // Small delay to ensure proper cleanup
      const timer = setTimeout(setupSubscription, 100);
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
