
import { useEffect, useState } from "react";

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrUrl: string;
}

function readBankInfo(): BankInfo {
  try {
    const raw = window.localStorage.getItem("bankInfo");
    if (raw) {
      const data = JSON.parse(raw);
      return {
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        accountHolder: data.accountHolder || "",
        qrUrl: data.qrUrl || ""
      };
    }
  } catch {}
  return { bankName: "", accountNumber: "", accountHolder: "", qrUrl: "" };
}

export function useBankInfo() {
  const [bankInfo, setBankInfo] = useState<BankInfo>(() => readBankInfo());

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "bankInfo") {
        setBankInfo(readBankInfo());
      }
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);

  // Ngoài ra, cập nhật khi window focus lại (tránh vấn đề khi ở cùng tab)
  useEffect(() => {
    const update = () => setBankInfo(readBankInfo());
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, []);

  return bankInfo;
}
