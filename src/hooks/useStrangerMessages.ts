
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StrangerMessage {
  id: string;
  content: string;
  sender: string;
  created_at: string;
}

export function useStrangerMessages(
  conversationId: string | null,
  userId: string | null
) {
  const [messages, setMessages] = useState<StrangerMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);

    let mounted = true;

    async function getMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (!mounted) return;
      if (error) {
        setMessages([]);
        setLoading(false);
        return;
      }
      setMessages(data);
      setLoading(false);
    }

    getMessages();

    // Subscribe realtime
    const channel = supabase
      .channel(`stranger-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as StrangerMessage]);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (text: string) => {
    if (!conversationId || !userId || !text.trim()) return false;
    const content = text.trim();
    const { error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          content,
          sender: userId,
        },
      ]);
    if (error) {
      console.error("[useStrangerMessages] Error sending message:", error);
      return false;
    }
    // Cập nhật last_message cho conversation
    await supabase
      .from("conversations")
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
    return true;
  };

  return { messages, loading, sendMessage };
}
