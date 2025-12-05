import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useFakePostComments(postId?: string) {
  const queryClient = useQueryClient();

  const { data: comments, isLoading, error } = useQuery({
    queryKey: ["fake-post-comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      
      // Get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("fake_post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      if (commentsError) throw commentsError;
      if (!commentsData || commentsData.length === 0) return [];
      
      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, avatar")
        .in("id", userIds);
      
      // Map profiles to comments
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      return commentsData.map(cmt => ({
        ...cmt,
        profiles: profilesMap.get(cmt.user_id) || null
      }));
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
