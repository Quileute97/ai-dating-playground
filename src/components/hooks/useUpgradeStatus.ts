
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UpgradeType = "gold" | "nearby";
export type UpgradeStatus = "pending" | "approved" | "rejected";

export interface UpgradeRequest {
  id: string;
  type: UpgradeType;
  status: UpgradeStatus;
  price: number;
  created_at: string | null;
  approved_at: string | null;
}

export function useUpgradeStatus(userId: string | null | undefined, type: UpgradeType) {
  return useQuery({
    queryKey: ["upgrade-status", userId, type],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("upgrade_requests")
        .select("id,type,status,price,created_at,approved_at")
        .eq("user_id", userId)
        .eq("type", type)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as UpgradeRequest | null;
    },
    staleTime: 30 * 1000,
    enabled: !!userId && !!type
  });
}
