
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRecentActivities(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["recent-activities", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Fixed: Get user_likes without problematic foreign key relationship
      const { data: likesData, error: likesError } = await supabase
        .from("user_likes")
        .select(`
          id,
          liker_id,
          liked_id,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (likesError) {
        console.error('Recent activities query error:', likesError);
        return [];
      }

      // Get profile information separately
      if (likesData && likesData.length > 0) {
        const likerIds = [...new Set(likesData.map(like => like.liker_id))];
        
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar")
          .in("id", likerIds);

        // Combine the data
        const activities = likesData.map(like => {
          const profile = profiles?.find(p => p.id === like.liker_id);
          return {
            id: like.id,
            type: 'like' as const,
            user: {
              id: like.liker_id,
              name: profile?.name || 'Unknown',
              avatar: profile?.avatar || null
            },
            created_at: like.created_at,
            message: `${profile?.name || 'Someone'} đã thích bạn`
          };
        });

        return activities;
      }

      return [];
    },
    staleTime: 30 * 1000,
    enabled: !!userId
  });
}
