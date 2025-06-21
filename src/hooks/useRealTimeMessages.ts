
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useRealTimeMessages(myUserId: string, friendId: string) {
  const queryClient = useQueryClient();
  
  // Tìm hoặc tạo conversation - sử dụng ID thật của user đã đăng nhập
  const { data: conversation } = useQuery({
    queryKey: ["conversation", myUserId, friendId],
    queryFn: async () => {
      // Tìm conversation hiện có giữa 2 user thật
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_real_id.eq.${myUserId},user_fake_id.eq.${friendId}),and(user_real_id.eq.${friendId},user_fake_id.eq.${myUserId})`)
        .limit(1);

      if (existingConv && existingConv.length > 0) {
        return existingConv[0];
      }

      // Tạo conversation mới giữa 2 user thật
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert([{
          user_real_id: myUserId,
          user_fake_id: friendId // Thực tế đây cũng là user thật, chỉ dùng tên cột có sẵn
        }])
        .select('id')
        .single();

      if (error) throw error;
      return newConv;
    },
    enabled: !!myUserId && !!friendId
  });

  // Lấy messages với sender_id để xác định ai gửi
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversation?.id],
    queryFn: async () => {
      if (!conversation?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversation?.id
  });

  // Enhanced realtime subscription cho messages với cross-tab sync
  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        console.log('💬 New message received:', payload.new);
        queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        
        // Cross-tab sync - invalidate trong tất cả tabs
        queryClient.invalidateQueries({ queryKey: ["conversation"] });
        queryClient.invalidateQueries({ queryKey: ["timeline-messages"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, queryClient]);

  // Send message mutation - lưu tin nhắn vĩnh viễn với enhanced sync
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversation?.id) throw new Error("No conversation found");
      
      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,
          content: content.trim(),
          sender: 'real', // Đánh dấu là tin nhắn từ user thật
          sender_id: myUserId
        }]);

      if (error) throw error;

      // Update last message in conversation
      await supabase
        .from('conversations')
        .update({
          last_message: content.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversation.id);
    },
    onSuccess: () => {
      // Enhanced sync cho tất cả related queries
      queryClient.invalidateQueries({ queryKey: ["messages", conversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      queryClient.invalidateQueries({ queryKey: ["timeline-messages"] });
    }
  });

  return {
    messages: messages || [],
    isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    sending: sendMessageMutation.isPending
  };
}
