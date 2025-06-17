
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useTimelinePosts(userId?: string) {
  const queryClient = useQueryClient();

  // Lấy tất cả bài post (sắp xếp mới nhất trước)
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["timeline-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
            *,
            profiles: user_id (id, name, avatar)
          `
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });

  // Realtime subscription cho posts
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('📊 Posts realtime update:', payload);
        queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      console.log('Creating post with values:', values);
      const { data, error } = await supabase.from("posts").insert([values]).select("*").single();
      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      console.log('Post created successfully');
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    }
  });

  // Xóa bài post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      console.log('Deleting post with ID:', postId);
      
      // Kiểm tra quyền xóa - chỉ chủ bài viết mới được xóa
      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching post:', fetchError);
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
        console.error('Error deleting post:', error);
        throw error;
      }
      
      console.log('Post deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
    }
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
