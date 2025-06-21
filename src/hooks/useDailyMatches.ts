
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDailyMatches(userId: string | undefined) {
  const [dailyMatches, setDailyMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchDailyMatches() {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Count likes made today by this user
        const { count, error } = await supabase
          .from('user_likes')
          .select('*', { count: 'exact', head: true })
          .eq('liker_id', userId)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`);

        if (error) throw error;
        
        setDailyMatches(count || 0);
      } catch (error) {
        console.error('Error fetching daily matches:', error);
        setDailyMatches(0);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyMatches();

    // Set up realtime subscription to update count when new likes are added
    const channel = supabase
      .channel('daily-matches-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_likes',
        filter: `liker_id=eq.${userId}`
      }, () => {
        fetchDailyMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { dailyMatches, loading, refetch: () => {
    if (userId) {
      setLoading(true);
    }
  }};
}
