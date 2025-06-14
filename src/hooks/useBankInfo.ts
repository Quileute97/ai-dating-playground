
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrUrl: string;
}

export function useBankInfo() {
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    qrUrl: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchBankInfo = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bank_info")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1);
    if (!error && data && data.length > 0) {
      setBankInfo({
        bankName: data[0].bank_name || "",
        accountNumber: data[0].account_number || "",
        accountHolder: data[0].account_holder || "",
        qrUrl: data[0].qr_url || "",
      });
    } else {
      setBankInfo({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        qrUrl: "",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBankInfo();
    // Lắng nghe realtime khi có update ở bank_info
    const channel = supabase
      .channel("bank_info_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bank_info" },
        fetchBankInfo
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBankInfo]);

  return { bankInfo, loading, refetch: fetchBankInfo };
}
