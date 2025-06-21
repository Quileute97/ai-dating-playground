
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook đảm bảo đồng bộ dữ liệu giữa các tab
 */
export function useGlobalSync(userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Đồng bộ profile updates
    const profileChannel = supabase
      .channel(`profile-sync-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('📱 Profile sync update:', payload);
        // Invalidate tất cả queries liên quan đến profile
        queryClient.invalidateQueries({ queryKey: ["unified-profile"] });
        queryClient.invalidateQueries({ queryKey: ["dating-profile"] });
        queryClient.invalidateQueries({ queryKey: ["nearby-profiles"] });
      })
      .subscribe();

    // Đồng bộ messages/conversations
    const messageChannel = supabase
      .channel(`messages-sync-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('💬 Messages sync update:', payload);
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["conversation"] });
      })
      .subscribe();

    // Đồng bộ timeline messages
    const timelineMessageChannel = supabase
      .channel(`timeline-messages-sync-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timeline_messages'
      }, (payload) => {
        console.log('📝 Timeline messages sync update:', payload);
        queryClient.invalidateQueries({ queryKey: ["timeline-messages"] });
      })
      .subscribe();

    // Đồng bộ user interactions (likes, matches)
    const interactionChannel = supabase
      .channel(`interactions-sync-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_likes'
      }, (payload) => {
        console.log('❤️ User interactions sync update:', payload);
        queryClient.invalidateQueries({ queryKey: ["user-likes"] });
        queryClient.invalidateQueries({ queryKey: ["daily-matches"] });
      })
      .subscribe();

    // Đồng bộ posts và comments
    const postsChannel = supabase
      .channel(`posts-sync-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('📊 Posts sync update:', payload);
        queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
      })
      .subscribe();

    const commentsChannel = supabase
      .channel(`comments-sync-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments'
      }, (payload) => {
        console.log('💭 Comments sync update:', payload);
        queryClient.invalidateQueries({ queryKey: ["timeline-comments"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(timelineMessageChannel);
      supabase.removeChannel(interactionChannel);
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [userId, queryClient]);

  return {
    // Trigger manual sync across all tabs
    syncAll: () => {
      queryClient.invalidateQueries();
    }
  };
}
