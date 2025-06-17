
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export function useTimelinePostLikes(userId?: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

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

  // Realtime subscription for all post likes
  useEffect(() => {
    if (!userId) return;

    const setupChannel = () => {
      // Clean up existing channel first
      if (channelRef.current) {
        console.log('Cleaning up existing post likes channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = `timeline-post-likes-${userId}-${Date.now()}`;
      console.log('Setting up post likes channel:', channelName);

      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        }, (payload) => {
          console.log('❤️ Timeline post likes update:', payload);
          queryClient.invalidateQueries({ queryKey: ["timeline-all-post-likes"] });
        })
        .subscribe((status) => {
          console.log('Post likes subscription status:', status);
        });

      channelRef.current = channel;
    };

    // Small delay to ensure proper cleanup
    const timer = setTimeout(setupChannel, 100);

    return () => {
      clearTimeout(timer);
      if (channelRef.current) {
        console.log('Cleaning up post likes channel on unmount');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, queryClient]);

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
  };
}
