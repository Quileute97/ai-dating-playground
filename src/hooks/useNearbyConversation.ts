
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender: string;
  created_at: string;
  media_url?: string;
  media_type?: string;
}

export function useNearbyConversation(currentUserId: string | null, targetUserId: string | null) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Tìm hoặc tạo conversation giữa 2 user
  useEffect(() => {
    if (!currentUserId || !targetUserId) return;

    async function findOrCreateConversation() {
      setLoading(true);
      
      // Tìm conversation đã có
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_real_id.eq.${currentUserId},user_fake_id.eq.${targetUserId}),and(user_real_id.eq.${targetUserId},user_fake_id.eq.${currentUserId})`)
        .limit(1);

      if (existingConv && existingConv.length > 0) {
        setConversationId(existingConv[0].id);
      } else {
        // Tạo conversation mới
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert([
            { user_real_id: currentUserId, user_fake_id: targetUserId },
            { user_real_id: targetUserId, user_fake_id: currentUserId }
          ])
          .select('id')
          .limit(1);

        if (newConv && newConv.length > 0) {
          setConversationId(newConv[0].id);
        }
      }
      setLoading(false);
    }

    findOrCreateConversation();
  }, [currentUserId, targetUserId]);

  // Load messages cho conversation
  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    }

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !currentUserId || !content.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        content: content.trim(),
        sender: currentUserId
      }]);

    if (error) {
      console.error('Error sending message:', error);
    }

    // Update last message in conversation
    await supabase
      .from('conversations')
      .update({
        last_message: content.trim(),
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);
  };

  return {
    messages,
    sendMessage,
    loading,
    conversationId
  };
}
