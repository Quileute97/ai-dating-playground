
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NearbySubscription {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "expired";
  price: number;
  duration_days: number | null;
  expires_at: string | null;
  created_at: string | null;
  approved_at: string | null;
}

export function useNearbySubscription(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["nearby-subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get the most recent active nearby subscription from user_subscriptions
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .like("package_type", "nearby%")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Map user_subscriptions fields to match expected interface
      const mappedData = {
        id: data.id,
        type: data.package_type,
        status: data.status as "pending" | "approved" | "rejected" | "expired",
        price: data.payment_amount || 0,
        duration_days: null,
        expires_at: data.expires_at,
        created_at: data.created_at,
        approved_at: data.started_at
      };
      
      // Check if subscription is still active
      const now = new Date();
      if (mappedData.expires_at && new Date(mappedData.expires_at) < now) {
        // Auto-expire the subscription locally
        return { ...mappedData, status: 'expired' as const, isExpired: true };
      }
      
      return { ...mappedData, status: 'approved' as const, isExpired: false } as NearbySubscription & { isExpired: boolean };
    },
    staleTime: 30 * 1000,
    enabled: !!userId
  });
}

export function useIsNearbyActive(userId: string | null | undefined) {
  const { data: subscription, isLoading } = useNearbySubscription(userId);
  
  return {
    isActive: subscription && !subscription.isExpired && subscription.status === 'approved',
    isLoading,
    subscription,
    daysRemaining: subscription?.expires_at && subscription.status === 'approved'
      ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : null
  };
}
