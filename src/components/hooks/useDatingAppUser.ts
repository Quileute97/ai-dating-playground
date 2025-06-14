
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export function useDatingAppUser() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      let storedAnonId = localStorage.getItem("anon_stranger_id");
      if (!storedAnonId) {
        storedAnonId = uuidv4();
        localStorage.setItem("anon_stranger_id", storedAnonId);
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
