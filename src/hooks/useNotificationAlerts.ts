import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.frequency.value = 830;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.25);

    // Second tone (higher, slight delay)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.frequency.value = 1100;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.4);

    setTimeout(() => audioCtx.close(), 500);
  } catch (e) {
    // Silently fail if audio is not supported
  }
};

export function useNotificationAlerts(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCheckedRef = useRef<string>(new Date().toISOString());
  const isFirstLoadRef = useRef(true);

  const showNotification = useCallback((title: string, description?: string) => {
    playNotificationSound();
    toast(title, {
      description,
      duration: 4000,
    });
    setUnreadCount(prev => prev + 1);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
    lastCheckedRef.current = new Date().toISOString();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Skip notifications on first load
    const timer = setTimeout(() => {
      isFirstLoadRef.current = false;
    }, 3000);

    const ts = Date.now();

    // Listen for new friend requests
    const friendChannel = supabase
      .channel(`notif-friends-${ts}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'friends',
        filter: `friend_id=eq.${userId}`,
      }, async (payload) => {
        if (isFirstLoadRef.current) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar')
          .eq('id', payload.new.user_id)
          .single();
        const name = profile?.name || 'Ai đó';
        if (payload.new.status === 'pending') {
          showNotification('📩 Lời mời kết bạn', `${name} đã gửi lời mời kết bạn`);
        } else if (payload.new.status === 'accepted') {
          showNotification('🤝 Bạn mới', `${name} đã chấp nhận lời mời kết bạn`);
        }
      })
      .subscribe();

    // Listen for likes on user's posts
    const postLikeChannel = supabase
      .channel(`notif-post-likes-${ts}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'post_likes',
      }, async (payload) => {
        if (isFirstLoadRef.current) return;
        // Check if this like is on user's post
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', payload.new.post_id)
          .single();
        if (post?.user_id !== userId) return;
        if (payload.new.user_id === userId) return;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.user_id)
          .single();
        showNotification('❤️ Lượt thích mới', `${profile?.name || 'Ai đó'} đã thích bài viết của bạn`);
      })
      .subscribe();

    // Listen for comments on user's posts
    const commentChannel = supabase
      .channel(`notif-comments-${ts}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
      }, async (payload) => {
        if (isFirstLoadRef.current) return;
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', payload.new.post_id)
          .single();
        if (post?.user_id !== userId) return;
        if (payload.new.user_id === userId) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.user_id)
          .single();
        showNotification('💬 Bình luận mới', `${profile?.name || 'Ai đó'} đã bình luận bài viết của bạn`);
      })
      .subscribe();

    // Listen for profile likes
    const userLikeChannel = supabase
      .channel(`notif-user-likes-${ts}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_likes',
        filter: `liked_id=eq.${userId}`,
      }, async (payload) => {
        if (isFirstLoadRef.current) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.liker_id)
          .single();
        showNotification('💖 Lượt thích hồ sơ', `${profile?.name || 'Ai đó'} đã thích hồ sơ của bạn`);
      })
      .subscribe();

    // Listen for new messages
    const messageChannel = supabase
      .channel(`notif-messages-${ts}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'timeline_messages',
        filter: `receiver_id=eq.${userId}`,
      }, async (payload) => {
        if (isFirstLoadRef.current) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.sender_id)
          .single();
        showNotification('✉️ Tin nhắn mới', `${profile?.name || 'Ai đó'} đã gửi tin nhắn cho bạn`);
      })
      .subscribe();

    // Listen for star donations received
    const starChannel = supabase
      .channel(`notif-stars-${ts}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'star_transactions',
        filter: `user_id=eq.${userId}`,
      }, async (payload) => {
        if (isFirstLoadRef.current) return;
        if (payload.new.type !== 'donate_received') return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.related_user_id)
          .single();
        showNotification('⭐ Nhận sao', `${profile?.name || 'Ai đó'} đã tặng bạn ${payload.new.amount} sao`);
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      [friendChannel, postLikeChannel, commentChannel, userLikeChannel, messageChannel, starChannel].forEach(ch => 
        supabase.removeChannel(ch)
      );
    };
  }, [userId, showNotification]);

  return { unreadCount, clearUnread };
}
