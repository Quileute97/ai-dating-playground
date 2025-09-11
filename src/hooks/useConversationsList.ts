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

      // Lấy tất cả conversations mà user tham gia (chỉ Dating và Nearby, không có stranger chat)
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

      // Nhóm conversations theo cặp user để thống nhất
      const userConversationMap = new Map<string, any>();

      // Lấy thông tin user khác trong mỗi conversation
      const conversationsWithUsers = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user_real_id === userId ? conv.user_fake_id : conv.user_real_id;
          
          // Kiểm tra xem đây có phải là fake user không (stranger chat)
          const { data: fakeUser } = await supabase
            .from("fake_users")
            .select("id")
            .eq("id", otherUserId)
            .single();

          // Nếu là fake user thì bỏ qua (không hiển thị stranger chat)
          if (fakeUser) {
            return null;
          }

          // Lấy thông tin user khác từ profiles
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("id, name, avatar")
            .eq("id", otherUserId)
            .single();

          if (!userProfile) return null;

          const conversationData = {
            ...conv,
            other_user: userProfile
          };

          // Kiểm tra xem đã có conversation với user này chưa
          const existingConv = userConversationMap.get(otherUserId);
          if (!existingConv || new Date(conv.last_message_at || 0) > new Date(existingConv.last_message_at || 0)) {
            userConversationMap.set(otherUserId, conversationData);
          }

          return conversationData;
        })
      );

      // Lọc bỏ null và lấy conversations duy nhất cho mỗi user
      const uniqueConversations = Array.from(userConversationMap.values())
        .filter(conv => conv !== null)
        .sort((a, b) => {
          const dateA = new Date(a.last_message_at || 0);
          const dateB = new Date(b.last_message_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

      return uniqueConversations as ConversationItem[];
    },
    enabled: !!userId
  });
}