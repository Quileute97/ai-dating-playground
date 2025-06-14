
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserLike(currentUserId?: string) {
  const [isProcessing, setIsProcessing] = useState(false);

  const likeUser = async (likedId: string) => {
    if (!currentUserId) {
      throw new Error("Current user id missing");
    }
    setIsProcessing(true);

    // Insert like
    await supabase.from("user_likes").insert({
      liker_id: currentUserId,
      liked_id: likedId,
    });

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
  };

  return { likeUser, isProcessing };
}
