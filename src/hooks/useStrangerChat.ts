
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
}

export function useStrangerChat(currentUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const { toast } = useToast();

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    console.log("📨 Setting up realtime for conversation:", conversationId);

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log("📨 Message realtime update:", payload);
        
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Tránh duplicate
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      })
      .subscribe();

    return () => {
      console.log("🔌 Cleaning up realtime subscription for:", conversationId);
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Load tin nhắn khi có conversation
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      console.log("📥 Loading messages for conversation:", conversationId);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("❌ Error loading messages:", error);
        return;
      }

      console.log("✅ Loaded messages:", data?.length || 0);
      setMessages(data || []);
    };

    loadMessages();
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !currentUserId || !content.trim()) {
      console.warn("❌ Cannot send message - missing data:", { conversationId, currentUserId, content: content.trim() });
      return;
    }

    try {
      console.log("📤 Sending message:", { conversationId, content: content.trim() });
      
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          content: content.trim(),
          sender: 'real',
          sender_id: currentUserId
        }])
        .select()
        .single();

      if (error) throw error;

      // Cập nhật last message trong conversation
      await supabase
        .from('conversations')
        .update({
          last_message: content.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      console.log("✅ Message sent successfully:", data);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast({
        title: "Lỗi gửi tin nhắn",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const setMatch = (convId: string, partner: string) => {
    console.log("🎯 Setting match:", { convId, partner });
    setConversationId(convId);
    setPartnerId(partner);
    setIsMatched(true);
    setMessages([]); // Clear old messages
  };

  const resetMatch = () => {
    console.log("🔄 Resetting match");
    setConversationId(null);
    setPartnerId(null);
    setIsMatched(false);
    setMessages([]);
  };

  return {
    messages,
    conversationId,
    partnerId,
    isMatched,
    sendMessage,
    setMatch,
    resetMatch
  };
}
