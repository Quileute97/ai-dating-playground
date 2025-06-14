import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTimelineComments(postId?: string) {
  const queryClient = useQueryClient();

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
