
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Regex kiểm tra UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useDatingAppUser() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      let storedAnonId = localStorage.getItem("anon_stranger_id");
      // Nếu không đúng UUID hợp lệ, hoặc không tồn tại, tạo mới
      if (!storedAnonId || !UUID_REGEX.test(storedAnonId)) {
        storedAnonId = uuidv4();
        localStorage.setItem("anon_stranger_id", storedAnonId);
        console.log("[DatingAppUser] Đã tạo/ghi đè anon_stranger_id mới:", storedAnonId);
      }
      setAnonId(storedAnonId);
    }
  }, [user]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, setUser, session, setSession, anonId };
}
