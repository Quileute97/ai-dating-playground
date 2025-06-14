
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook để gửi yêu cầu nâng cấp tài khoản tới Supabase.
 */
export function useUpgradeRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitUpgradeRequest = async ({
    user_id,
    user_email,
    type,
    price,
    bank_info,
  }: {
    user_id: string;
    user_email?: string;
    type: "gold" | "nearby";
    price: number;
    bank_info?: any;
  }) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("upgrade_requests")
      .insert([
        {
          user_id,
          user_email,
          type,
          price,
          bank_info,
        },
      ]);
    setLoading(false);

    if (error) {
      setError(error.message);
      return false;
    }
    return true;
  };

  return { submitUpgradeRequest, loading, error };
}
