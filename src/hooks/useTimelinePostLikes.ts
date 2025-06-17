
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import { useState } from "react";

export function useTimelinePostLikes(userId?: string) {
  const queryClient = useQueryClient();
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Get all post likes for timeline posts
  const { data: allLikes = [], isLoading } = useQuery({
    queryKey: ["timeline-all-post-likes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("post_likes")
          .select("post_id, user_id");
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching post likes:', error);
        return [];
      }
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: 1000,
  });

  // Realtime subscription for all post likes with error handling
  useRealtimeSubscription({
    channelName: `timeline-post-likes-${userId}`,
    table: 'post_likes',
    queryKey: ["timeline-all-post-likes"],
    enabled: !!userId,
    onError: (error) => {
      console.error('❌ Post likes subscription error:', error);
      setSubscriptionError(error.message);
    }
  });

  // Helper functions
  const isPostLiked = (postId: string) => {
    return allLikes.some(like => like.post_id === postId && like.user_id === userId);
  };

  const getPostLikeCount = (postId: string) => {
    return allLikes.filter(like => like.post_id === postId).length;
  };

  // Like/unlike mutations
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!userId) throw new Error("User ID required");
      const { error } = await supabase
        .from("post_likes")
        .insert([{ post_id: postId, user_id: userId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-all-post-likes"] });
    },
    onError: (error) => {
      console.error('Error liking post:', error);
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!userId) throw new Error("User ID required");
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-all-post-likes"] });
    },
    onError: (error) => {
      console.error('Error unliking post:', error);
    }
  });

  const toggleLike = async (postId: string) => {
    if (!userId) return;
    
    try {
      if (isPostLiked(postId)) {
        await unlikeMutation.mutateAsync(postId);
      } else {
        await likeMutation.mutateAsync(postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  return {
    isPostLiked,
    getPostLikeCount,
    toggleLike,
    isLoading,
    isToggling: likeMutation.isPending || unlikeMutation.isPending,
    subscriptionError,
  };
}
