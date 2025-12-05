import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnlinePresence(userId?: string, userName?: string) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: userId || 'anonymous',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).flat();
        setOnlineUsers(users);
        setOnlineCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('👋 User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('👋 User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userId) {
          await channel.track({
            user_id: userId,
            user_name: userName || 'Ẩn danh',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userName]);

  return { onlineCount, onlineUsers };
}
