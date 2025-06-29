
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserMatches(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-matches", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];

      // Lấy danh sách người đã match (mutual likes)
      const { data: myLikes, error: myLikesError } = await supabase
        .from("user_likes")
        .select("liked_id")
        .eq("liker_id", userId);

      if (myLikesError) throw myLikesError;

      const { data: theirLikes, error: theirLikesError } = await supabase
        .from("user_likes")
        .select("liker_id")
        .eq("liked_id", userId);

      if (theirLikesError) throw theirLikesError;

      // Tìm những người đã like lẫn nhau (mutual likes)
      const myLikedIds = myLikes.map(like => like.liked_id);
      const theirLikedIds = theirLikes.map(like => like.liker_id);
      
      const mutualLikes = myLikedIds.filter(id => theirLikedIds.includes(id));

      if (mutualLikes.length === 0) return [];

      // Lấy thông tin profile của những người đã match
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", mutualLikes);

      if (profilesError) throw profilesError;

      return profiles || [];
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}
