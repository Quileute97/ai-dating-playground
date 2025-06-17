
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import { useState } from "react";

export function useTimelineComments(postId?: string) {
  const queryClient = useQueryClient();
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

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

  // Realtime subscription cho comments with error handling
  useRealtimeSubscription({
    channelName: `comments-${postId}`,
    table: 'comments',
    filter: postId ? `post_id=eq.${postId}` : undefined,
    queryKey: ["timeline-comments", postId],
    enabled: !!postId,
    onError: (error) => {
      console.error('❌ Comments subscription error:', error);
      setSubscriptionError(error.message);
    }
  });

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
    subscriptionError,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["timeline-comments", postId] }),
    createComment: createCommentMutation.mutateAsync,
    creating: createCommentMutation.isPending
  };
}
