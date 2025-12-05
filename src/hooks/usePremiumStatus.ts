import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: string | null;
  daysRemaining: number | null;
  packageType?: string;
}

export function usePremiumStatus(userId?: string) {
  const queryClient = useQueryClient();

  const { data: premiumStatus, isLoading, error } = useQuery({
    queryKey: ['premium-status', userId],
    queryFn: async (): Promise<PremiumStatus> => {
      if (!userId) {
        return {
          isPremium: false,
          expiresAt: null,
          daysRemaining: null
        };
      }

      // Get user's profile with premium info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching premium status:', profileError);
        throw profileError;
      }

      const now = new Date();
      let daysRemaining = null;
      let isPremiumActive = profile.is_premium || false;

      // Check if premium has expired
      if (profile.premium_expires) {
        const expirationDate = new Date(profile.premium_expires);
        daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // If expired, mark as not premium
        if (daysRemaining <= 0) {
          isPremiumActive = false;
          daysRemaining = 0;
          
          // Automatically update the profile if expired
          await supabase
            .from('profiles')
            .update({
              is_premium: false,
              premium_expires: null
            })
            .eq('id', userId);
        }
      }

      // Get subscription details
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('package_type, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        isPremium: isPremiumActive,
        expiresAt: profile.premium_expires,
        daysRemaining,
        packageType: subscription?.package_type
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute to check for expiration
  });

  // Auto-refresh when premium status changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`premium-status-${userId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['premium-status', userId] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_subscriptions',
        filter: `user_id=eq.${userId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['premium-status', userId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    premiumStatus,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['premium-status', userId] })
  };
}