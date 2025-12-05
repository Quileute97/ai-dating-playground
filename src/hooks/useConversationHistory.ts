
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  sender: "real" | "fake" | "admin";
  content: string;
  created_at: string;
  media_url?: string;
  media_type?: string;
}

export interface Conversation {
  id: string;
  user_real_id: string;
  user_fake_id: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  messages: Message[];
}

export function useConversationHistory(userRealId: string, userFakeId: string | null) {
  return useQuery({
    queryKey: ["conversation-history", userRealId, userFakeId],
    enabled: !!userRealId && !!userFakeId,
    queryFn: async () => {
      // Lấy cuộc hội thoại hiện có giữa user thật và user ảo
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, user_real_id, user_fake_id, created_at, last_message, last_message_at")
        .eq("user_real_id", userRealId)
        .eq("user_fake_id", userFakeId)
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) throw error;
      if (!conversations || conversations.length === 0) return null;

      const conversation = conversations[0];
      // Lấy messages thuộc hội thoại này
      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      return {
        ...conversation,
        messages: messages || [],
      } as Conversation;
    }
  });
}
