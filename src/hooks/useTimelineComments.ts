
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export function useTimelineComments(postId?: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Lấy tất cả comment của postId truyền vào
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ["timeline-comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("comments")
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

  // Realtime subscription cho comments
  useEffect(() => {
    if (!postId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`comments-${postId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, (payload) => {
        console.log('💬 Comments realtime update:', payload);
        queryClient.invalidateQueries({ queryKey: ["timeline-comments", postId] });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [postId, queryClient]);

  // Thêm comment mới
  const createCommentMutation = useMutation({
    mutationFn: async (values: { content: string; user_id: string; post_id: string }) => {
      const { data, error } = await supabase.from("comments").insert([values]).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-comments", postId] });
    }
  });

  return {
    comments,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["timeline-comments", postId] }),
    createComment: createCommentMutation.mutateAsync,
    creating: createCommentMutation.isPending
  };
}
