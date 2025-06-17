
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export function useTimelinePosts(userId?: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Lấy tất cả bài post (sắp xếp mới nhất trước)
  const { data: posts, isLoading, error } = useQuery({
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
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Realtime subscription cho posts
  useEffect(() => {
    // Chỉ setup nếu chưa subscribe
    if (isSubscribedRef.current) {
      console.log('⚠️ Already subscribed to posts channel, skipping');
      return;
    }

    const setupChannel = () => {
      // Clean up existing channel first
      if (channelRef.current) {
        console.log('🧹 Cleaning up existing posts channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }

      const channelName = `posts-changes-${Date.now()}`;
      console.log('🔗 Setting up posts channel:', channelName);

      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('📊 Posts realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
        })
        .subscribe((status) => {
          console.log('📡 Posts subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            isSubscribedRef.current = false;
          }
        });

      channelRef.current = channel;
    };

    // Small delay to ensure proper cleanup
    const timer = setTimeout(setupChannel, 100);

    return () => {
      clearTimeout(timer);
      if (channelRef.current) {
        console.log('🧹 Cleaning up posts channel on unmount');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [queryClient]);

  // Thêm bài post mới
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

  // Xóa bài post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      console.log('🗑️ Deleting post with ID:', postId);
      
      // Kiểm tra quyền xóa - chỉ chủ bài viết mới được xóa
      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();
        
      if (fetchError) {
        console.error('❌ Error fetching post:', fetchError);
        throw new Error("Không tìm thấy bài viết");
      }

      // Lấy user hiện tại
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || post.user_id !== user.id) {
        throw new Error("Bạn không có quyền xóa bài viết này");
      }

      // Xóa bài viết
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
    hasError: !!error 
  });

  return {
    posts,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["timeline-posts"] }),
    createPost: createPostMutation.mutateAsync,
    creating: createPostMutation.isPending,
    deletePost: deletePostMutation.mutateAsync,
    deleting: deletePostMutation.isPending,
  };
}
