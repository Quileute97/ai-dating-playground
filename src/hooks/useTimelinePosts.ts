
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import { useState } from "react";

export function useTimelinePosts(userId?: string) {
  const queryClient = useQueryClient();
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Fetch all posts (sorted newest first)
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ["timeline-posts"],
    queryFn: async () => {
      console.log('🔄 Fetching timeline posts...');
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
              *,
              profiles: user_id (id, name, avatar)
            `
          )
          .order("created_at", { ascending: false });
        
        console.log('📊 Posts fetched:', data?.length || 0, 'posts');
        
        if (error) {
          console.error('❌ Error fetching posts:', error);
          throw error;
        }
        return data ?? [];
      } catch (error) {
        console.error('❌ Error in posts query:', error);
        // Don't throw error, return empty array to allow graceful degradation
        return [];
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Prevent constant refetching
  });

  // Realtime subscription for posts with error handling
  useRealtimeSubscription({
    channelName: 'timeline-posts',
    table: 'posts',
    queryKey: ["timeline-posts"],
    enabled: true,
    onError: (error) => {
      console.error('❌ Posts subscription error:', error);
      setSubscriptionError(error.message);
    }
  });

  // Create new post
  const createPostMutation = useMutation({
    mutationFn: async (values: {
      content: string;
      user_id: string;
      media_url?: string;
      media_type?: string;
      location?: any;
    }) => {
      console.log('✍️ Creating post with values:', values);
      const { data, error } = await supabase.from("posts").insert([values]).select("*").single();
      if (error) {
        console.error('❌ Error creating post:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      console.log('✅ Post created successfully');
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    },
    onError: (error) => {
      console.error('❌ Failed to create post:', error);
    }
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      console.log('🗑️ Deleting post with ID:', postId);
      
      // Check deletion permissions - only post owner can delete
      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();
        
      if (fetchError) {
        console.error('❌ Error fetching post:', fetchError);
        throw new Error("Không tìm thấy bài viết");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || post.user_id !== user.id) {
        throw new Error("Bạn không có quyền xóa bài viết này");
      }

      // Delete post
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);
        
      if (error) {
        console.error('❌ Error deleting post:', error);
        throw error;
      }
      
      console.log('✅ Post deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    },
    onError: (error) => {
      console.error('❌ Failed to delete post:', error);
    }
  });

  console.log('🔍 Timeline posts hook state:', { 
    postsCount: posts?.length || 0, 
    isLoading, 
    hasError: !!error,
    subscriptionError,
    errorMessage: error?.message
  });

  return {
    posts,
    isLoading,
    error,
    subscriptionError,
    refetch,
    createPost: createPostMutation.mutateAsync,
    creating: createPostMutation.isPending,
    deletePost: deletePostMutation.mutateAsync,
    deleting: deletePostMutation.isPending,
  };
}
