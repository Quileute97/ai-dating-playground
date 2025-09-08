
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useUserLike(currentUserId?: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Realtime subscription cho user likes
  useEffect(() => {
    if (!currentUserId) return;

    const channelName = `user-likes-${currentUserId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_likes'
      }, (payload) => {
        console.log('💕 User likes realtime update:', payload);
        // Invalidate các queries liên quan đến user likes
        queryClient.invalidateQueries({ queryKey: ["user-likes"] });
        queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  const likeUser = async (likedId: string) => {
    if (!currentUserId) {
      throw new Error("Current user id missing");
    }
    setIsProcessing(true);

    try {
      // Insert like
      const { error: insertError } = await supabase.from("user_likes").insert({
        liker_id: currentUserId,
        liked_id: likedId,
      });

      if (insertError) throw insertError;

      // Check if liked user also liked back
      const { data, error } = await supabase
        .from("user_likes")
        .select("id")
        .eq("liker_id", likedId)
        .eq("liked_id", currentUserId)
        .maybeSingle();

      setIsProcessing(false);

      // Nếu có lượt like ngược => MATCH
      return { matched: !!data, error };
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  };

  return { likeUser, isProcessing };
}
