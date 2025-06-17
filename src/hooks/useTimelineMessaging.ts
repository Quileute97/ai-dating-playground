
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface TimelineMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface ConversationSummary {
  user_id: string;
  user_name: string;
  user_avatar: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export function useTimelineMessaging(currentUserId: string) {
  const queryClient = useQueryClient();

  // Get conversations with message summaries
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["timeline-conversations", currentUserId],
    queryFn: async (): Promise<ConversationSummary[]> => {
      if (!currentUserId) return [];

      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from("timeline_messages")
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          read,
          created_at
        `)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationsMap = new Map<string, ConversationSummary>();

      for (const message of messages || []) {
        const partnerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          // Get partner profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, name, avatar")
            .eq("id", partnerId)
            .single();

          conversationsMap.set(partnerId, {
            user_id: partnerId,
            user_name: profile?.name || "Unknown User",
            user_avatar: profile?.avatar || "/placeholder.svg",
            last_message: message.content,
            last_message_at: message.created_at,
            unread_count: 0
          });
        }

        // Count unread messages (messages sent to current user that are unread)
        if (message.receiver_id === currentUserId && !message.read) {
          const conversation = conversationsMap.get(partnerId)!;
          conversation.unread_count++;
        }
      }

      return Array.from(conversationsMap.values());
    },
    enabled: !!currentUserId,
  });

  // Get messages for specific conversation
  const getMessages = (partnerId: string) => {
    return useQuery({
      queryKey: ["timeline-messages", currentUserId, partnerId],
      queryFn: async (): Promise<TimelineMessage[]> => {
        if (!currentUserId || !partnerId) return [];

        const { data, error } = await supabase
          .from("timeline_messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data || [];
      },
      enabled: !!currentUserId && !!partnerId,
    });
  };

  // Real-time subscription for timeline messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`timeline-messages-${currentUserId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timeline_messages',
        filter: `or(sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId})`
      }, (payload) => {
        console.log('📨 Timeline messages realtime update:', payload);
        queryClient.invalidateQueries({ queryKey: ["timeline-conversations", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["timeline-messages"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (!currentUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("timeline_messages")
        .insert([{
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: content.trim(),
          read: false
        }])
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-conversations", currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["timeline-messages"] });
    }
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (senderId: string) => {
      if (!currentUserId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("timeline_messages")
        .update({ read: true })
        .eq("sender_id", senderId)
        .eq("receiver_id", currentUserId)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-conversations", currentUserId] });
    }
  });

  return {
    conversations,
    conversationsLoading,
    getMessages,
    sendMessage: sendMessageMutation.mutateAsync,
    sendingMessage: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutateAsync,
  };
}
