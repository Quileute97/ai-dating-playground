
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Thêm bài post mới
  const createPostMutation = useMutation({
    mutationFn: async (values: {
      content: string;
      user_id: string; // uuid
      media_url?: string;
      media_type?: string;
      sticker?: any;
      location?: any;
    }) => {
      const { data, error } = await supabase.from("posts").insert([values]).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    }
  });

  return {
    posts,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["timeline-posts"] }),
    createPost: createPostMutation.mutateAsync,
    creating: createPostMutation.isPending,
  };
}

