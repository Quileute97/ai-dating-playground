
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
      try {
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
      } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
    },
    enabled: !!postId,
    retry: 3,
    retryDelay: 1000,
  });

  // Realtime subscription cho comments
  useEffect(() => {
    if (!postId) return;

    const setupChannel = () => {
      // Clean up existing channel first
      if (channelRef.current) {
        console.log('Cleaning up existing comments channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = `comments-${postId}-${Date.now()}`;
      console.log('Setting up comments channel:', channelName);

      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        }, (payload) => {
          console.log('💬 Comments realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ["timeline-comments", postId] });
        })
        .subscribe((status) => {
          console.log('Comments subscription status:', status);
        });

      channelRef.current = channel;
    };

    // Small delay to ensure proper cleanup
    const timer = setTimeout(setupChannel, 100);

    return () => {
      clearTimeout(timer);
      if (channelRef.current) {
        console.log('Cleaning up comments channel on unmount');
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
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
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
