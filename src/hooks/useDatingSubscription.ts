
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DatingSubscription {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "expired";
  price: number;
  duration_days: number | null;
  expires_at: string | null;
  created_at: string | null;
  approved_at: string | null;
}

export function useDatingSubscription(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["dating-subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get the most recent approved dating subscription
      const { data, error } = await supabase
        .from("upgrade_requests")
        .select("*")
        .eq("user_id", userId)
        .like("type", "dating%")
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Check if subscription is still active
      const now = new Date();
      if (data.expires_at && new Date(data.expires_at) < now) {
        // Auto-expire the subscription locally
        return { ...data, status: 'expired', isExpired: true };
      }
      
      return { ...data, isExpired: false } as DatingSubscription & { isExpired: boolean };
    },
    staleTime: 30 * 1000,
    enabled: !!userId
  });
}

export function useIsDatingActive(userId: string | null | undefined) {
  const { data: subscription, isLoading } = useDatingSubscription(userId);
  
  return {
    isActive: subscription && !subscription.isExpired && subscription.status === 'approved',
    isLoading,
    subscription,
    daysRemaining: subscription?.expires_at && subscription.status === 'approved'
      ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : null
  };
}
