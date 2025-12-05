
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NearbySubscription {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
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
      
      // Get the most recent approved nearby subscription
      const { data, error } = await supabase
        .from("upgrade_requests")
        .select("*")
        .eq("user_id", userId)
        .like("type", "nearby%")
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Check if subscription is still active
      const now = new Date();
      if (data.expires_at && new Date(data.expires_at) < now) {
        return { ...data, isExpired: true };
      }
      
      return { ...data, isExpired: false } as NearbySubscription & { isExpired: boolean };
    },
    staleTime: 30 * 1000,
    enabled: !!userId
  });
}

export function useIsNearbyActive(userId: string | null | undefined) {
  const { data: subscription, isLoading } = useNearbySubscription(userId);
  
  return {
    isActive: subscription && !subscription.isExpired,
    isLoading,
    subscription,
    daysRemaining: subscription?.expires_at 
      ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : null
  };
}
