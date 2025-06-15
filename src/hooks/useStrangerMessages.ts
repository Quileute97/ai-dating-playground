
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StrangerMessage {
  id: string;
  content: string;
  sender: string;
  created_at: string;
}

export function useStrangerMessages(conversationId: string | null, userId: string | null) {
  const [messages, setMessages] = useState<StrangerMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load + subscribe messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    let mounted = true;

    async function getMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!mounted) return;
      if (error || !data) {
        setMessages([]);
        setLoading(false);
        return;
      }
      setMessages(data);
      setLoading(false);
    }
    getMessages();

    // Realtime subscribe
    const channel = supabase
      .channel(`stranger-messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as StrangerMessage]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Gửi message mới
  const sendMessage = async (text: string) => {
    if (!conversationId || !userId || !text.trim()) return false;
    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        content: text.trim(),
        sender: userId
      }]);
    if (error) {
      console.error('[useStrangerMessages] Error sending message:', error);
      return false;
    }
    // Update conversation last message
    await supabase.from('conversations').update({
      last_message: text.trim(),
      last_message_at: new Date().toISOString()
    }).eq('id', conversationId);
    return true;
  };

  return { messages, loading, sendMessage };
}
