
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: string | null;
  daysRemaining: number | null;
}

export function usePremiumStatus(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["premium-status", userId],
    queryFn: async (): Promise<PremiumStatus> => {
      if (!userId) {
        return { isPremium: false, expiresAt: null, daysRemaining: null };
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching premium status:", error);
        return { isPremium: false, expiresAt: null, daysRemaining: null };
      }
      
      if (!data) {
        return { isPremium: false, expiresAt: null, daysRemaining: null };
      }
      
      const now = new Date();
      const expiresAt = data.premium_expires ? new Date(data.premium_expires) : null;
      
      // Kiểm tra xem Premium có hết hạn không
      const isPremium = data.is_premium && (!expiresAt || expiresAt > now);
      
      // Tính số ngày còn lại
      const daysRemaining = expiresAt && isPremium
        ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      return {
        isPremium,
        expiresAt: data.premium_expires,
        daysRemaining
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!userId
  });
}
