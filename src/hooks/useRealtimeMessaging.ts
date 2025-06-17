
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface TimelineMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_profile?: {
    id: string;
    name: string;
    avatar: string;
  };
  receiver_profile?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface ChatConversation {
  user_id: string;
  user_name: string;
  user_avatar: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export function useRealtimeMessaging(currentUserId?: string) {
  const queryClient = useQueryClient();

  // Get all conversations for current user
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["timeline-conversations", currentUserId],
    enabled: !!currentUserId,
    queryFn: async () => {
      if (!currentUserId) return [];

      // Get messages with profile information
      const { data: messages, error } = await supabase
        .from("timeline_messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get unique partner IDs
      const partnerIds = new Set<string>();
      messages?.forEach((msg: any) => {
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        partnerIds.add(partnerId);
      });

      // Get profiles for all partners
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar")
        .in("id", Array.from(partnerIds));

      if (profilesError) throw profilesError;

      // Group messages by conversation partner
      const conversationMap = new Map<string, ChatConversation>();
      
      messages?.forEach((msg: any) => {
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        const partnerProfile = profiles?.find(p => p.id === partnerId);
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user_id: partnerId,
            user_name: partnerProfile?.name || "User",
            user_avatar: partnerProfile?.avatar || "/placeholder.svg",
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0
          });
        }
      });

      return Array.from(conversationMap.values());
    }
  });

  // Get messages for specific conversation
  const getMessages = (partnerId: string) => {
    return useQuery({
      queryKey: ["timeline-messages", currentUserId, partnerId],
      enabled: !!currentUserId && !!partnerId,
      queryFn: async () => {
        if (!currentUserId || !partnerId) return [];

        const { data: messages, error } = await supabase
          .from("timeline_messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Get profiles for sender and receiver
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, avatar")
          .in("id", [currentUserId, partnerId]);

        if (profilesError) throw profilesError;

        // Attach profile information to messages
        const messagesWithProfiles = messages?.map((msg: any) => ({
          ...msg,
          sender_profile: profiles?.find(p => p.id === msg.sender_id),
          receiver_profile: profiles?.find(p => p.id === msg.receiver_id)
        }));

        return messagesWithProfiles as TimelineMessage[];
      }
    });
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (!currentUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("timeline_messages")
        .insert([{
          sender_id: currentUserId,
          receiver_id: receiverId,
          content,
          read: false
        }])
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-conversations", currentUserId] });
    }
  });

  // Realtime subscription for messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('timeline-messages-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timeline_messages',
        filter: `receiver_id=eq.${currentUserId}`
      }, (payload) => {
        console.log('📨 New timeline message:', payload);
        queryClient.invalidateQueries({ queryKey: ["timeline-conversations", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["timeline-messages", currentUserId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  return {
    conversations,
    conversationsLoading,
    getMessages,
    sendMessage: sendMessageMutation.mutateAsync,
    sendingMessage: sendMessageMutation.isPending
  };
}
