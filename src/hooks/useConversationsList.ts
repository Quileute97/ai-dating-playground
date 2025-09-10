import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConversationItem {
  id: string;
  user_real_id: string;
  user_fake_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  other_user: {
    id: string;
    name: string;
    avatar: string;
  } | null;
}

export function useConversationsList(userId: string) {
  return useQuery({
    queryKey: ["conversations-list", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Lấy tất cả conversations mà user tham gia
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          id,
          user_real_id,
          user_fake_id,
          last_message,
          last_message_at,
          created_at
        `)
        .or(`user_real_id.eq.${userId},user_fake_id.eq.${userId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;

      if (!conversations || conversations.length === 0) return [];

      // Lấy thông tin user khác trong mỗi conversation
      const conversationsWithUsers = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user_real_id === userId ? conv.user_fake_id : conv.user_real_id;
          
          // Lấy thông tin user khác
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("id, name, avatar")
            .eq("id", otherUserId)
            .single();

          return {
            ...conv,
            other_user: userProfile || {
              id: otherUserId,
              name: "Unknown User",
              avatar: "/placeholder.svg"
            }
          };
        })
      );

      return conversationsWithUsers as ConversationItem[];
    },
    enabled: !!userId
  });
}