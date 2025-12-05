
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useStrangerQueue() {
  const [isInQueue, setIsInQueue] = useState(false);
  const queryClient = useQueryClient();

  // Realtime subscription cho stranger queue
  useEffect(() => {
    const channel = supabase
      .channel('stranger-queue-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stranger_queue'
      }, (payload) => {
        console.log('🎯 Stranger queue realtime update:', payload);
        queryClient.invalidateQueries({ queryKey: ["stranger-queue"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const joinQueue = async (userId: string) => {
    try {
      // Kiểm tra nếu đã có trong queue
      const { data: existing } = await supabase
        .from("stranger_queue")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase
          .from("stranger_queue")
          .insert([{ user_id: userId }]);
        
        if (error) throw error;
        console.log("✅ Joined stranger queue successfully");
      }
      
      setIsInQueue(true);
    } catch (error) {
      console.error("❌ Error joining queue:", error);
      throw error;
    }
  };

  const leaveQueue = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("stranger_queue")
        .delete()
        .eq("user_id", userId);
      
      if (error) throw error;
      setIsInQueue(false);
      console.log("✅ Left stranger queue successfully");
    } catch (error) {
      console.error("❌ Error leaving queue:", error);
      throw error;
    }
  };

  return {
    isInQueue,
    joinQueue,
    leaveQueue,
    setIsInQueue
  };
}
