import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useFakePostComments(postId?: string) {
  const queryClient = useQueryClient();

  const { data: comments, isLoading, error } = useQuery({
    queryKey: ["fake-post-comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("fake_post_comments")
        .select(`
          *,
          profiles: user_id (id, name, avatar)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!postId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!postId) return;

    const channelName = `fake-post-comments-${postId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fake_post_comments',
        filter: `post_id=eq.${postId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["fake-post-comments", postId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return {
    comments,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["fake-post-comments", postId] }),
  };
}
