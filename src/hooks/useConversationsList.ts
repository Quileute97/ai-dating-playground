import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

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
  const queryClient = useQueryClient();

  // Set up realtime subscription for conversations
  useEffect(() => {
    if (!userId) return;

    const channelName = `conversations-list-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, (payload) => {
        console.log('💬 Conversations realtime update:', payload);
        queryClient.invalidateQueries({ queryKey: ["conversations-list", userId] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        console.log('💬 Messages realtime update:', payload);
        queryClient.invalidateQueries({ queryKey: ["conversations-list", userId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ["conversations-list", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Lấy TẤT CẢ conversations mà user tham gia (bao gồm cả real và fake users)
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

      // Nhóm conversations theo user để tránh trùng lặp
      const userConversationMap = new Map<string, any>();

      // Lấy thông tin user khác trong mỗi conversation
      const conversationsWithUsers = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user_real_id === userId ? conv.user_fake_id : conv.user_real_id;
          
          // Kiểm tra xem đây có phải là fake user không
          const { data: fakeUser } = await supabase
            .from("fake_users")
            .select("id, name, avatar")
            .eq("id", otherUserId)
            .single();

          let userProfile;
          
          if (fakeUser) {
            // Nếu là fake user, dùng thông tin từ fake_users
            userProfile = {
              id: fakeUser.id,
              name: fakeUser.name,
              avatar: fakeUser.avatar
            };
          } else {
            // Nếu là user thật, lấy thông tin từ profiles
            const { data: realUser } = await supabase
              .from("profiles")
              .select("id, name, avatar")
              .eq("id", otherUserId)
              .single();

            if (!realUser) return null;
            userProfile = realUser;
          }

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
          // Sắp xếp theo last_message_at, tin nhắn mới nhất lên trên
          const dateA = new Date(a.last_message_at || a.created_at || 0);
          const dateB = new Date(b.last_message_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

      return uniqueConversations as ConversationItem[];
    },
    enabled: !!userId,
    staleTime: 10 * 1000, // Cache trong 10 giây
    refetchInterval: 30 * 1000, // Tự động refetch mỗi 30 giây
  });
}