
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StrangerMessage {
  id: string;
  conversation_id: string;
  sender: string;
  content: string;
  created_at: string;
}

export function useStrangerMessages(conversationId: string | null, currentUserId: string | null) {
  const [messages, setMessages] = useState<StrangerMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    let unsub: (() => void) | undefined;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }
      setLoading(false);
    }

    loadMessages();

    // Subscribe
    const channel = supabase
      .channel(`messages-${conversationId}`)
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

    unsub = () => {
      supabase.removeChannel(channel);
    };

    return unsub;
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !currentUserId || !content.trim()) return false;
    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: currentUserId,
        content: content.trim(),
      },
    ]);
    if (!error) {
      // No-op: real-time subscription will update UI, don't add local echo
      return true;
    }
    return false;
  };

  return { messages, sendMessage, loading };
}
