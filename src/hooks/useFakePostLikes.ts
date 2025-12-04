import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useFakePostLikes(postId?: string, userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["fake-post-likes", postId],
    queryFn: async () => {
      if (!postId) return { count: 0, liked: false };
      const { data, error } = await supabase
        .from("fake_post_likes")
        .select("id, user_id")
        .eq("post_id", postId);
      if (error) throw error;
      return {
        count: data?.length ?? 0,
        liked: !!data?.find(l => l.user_id === userId)
      };
    },
    enabled: !!postId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!postId) return;

    const channelName = `fake-post-likes-${postId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fake_post_likes',
        filter: `post_id=eq.${postId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["fake-post-likes", postId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return {
    likeCount: data?.count ?? 0,
    liked: data?.liked ?? false,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["fake-post-likes", postId] }),
  };
}
