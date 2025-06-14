
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePostLikes(postId?: string, userId?: string) {
  const queryClient = useQueryClient();

  // Lấy danh sách like và kiểm tra trạng thái đã like chưa
  const { data, isLoading, error } = useQuery({
    queryKey: ["post-likes", postId],
    queryFn: async () => {
      if (!postId) return { count: 0, liked: false };
      const { data, error } = await supabase
        .from("post_likes")
        .select("id, user_id")
        .eq("post_id", postId);
      if (error) throw error;
      return {
        count: data?.length ?? 0,
        liked: !!data?.find(l => l.user_id === userId)
      };
    },
    enabled: !!postId,
  });

  // Like post
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!postId || !userId) throw new Error("Need postId and userId");
      const { error } = await supabase.from("post_likes").insert([{ post_id: postId, user_id: userId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
    }
  });

  // Unlike post
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      if (!postId || !userId) throw new Error("Need postId and userId");
      const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
    }
  });

  return {
    likeCount: data?.count ?? 0,
    liked: data?.liked ?? false,
    isLoading,
    error,
    like: likeMutation.mutateAsync,
    unlike: unlikeMutation.mutateAsync,
    isToggling:
      likeMutation.isPending || unlikeMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["post-likes", postId] }),
  };
}
