
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFriendList } from "./useFriends";

// Định nghĩa kiểu dữ liệu profile
export interface FriendProfile {
  id: string;
  name: string;
  avatar: string | null;
  online: boolean;
}

export function useActiveFriendsWithPresence(myId: string | undefined) {
  // Lấy danh sách bạn bè thật từ Supabase
  const { data: friends, isLoading: friendsLoading } = useFriendList(myId);

  // Danh sách bạn bè kèm info
  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>([]);
  // Danh sách userId đang online (từ presence)
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  // 1. Lấy thông tin profile của bạn bè
  useEffect(() => {
    if (!friends || friends.length === 0) {
      setFriendProfiles([]);
      return;
    }
    // Lấy ra tất cả id bạn bè (không phải là mình)
    const allIds = friends.map(f =>
      f.user_id === myId ? f.friend_id : f.user_id
    );
    if (allIds.length === 0) {
      setFriendProfiles([]);
      return;
    }
    // Truy vấn bảng profiles lấy thông tin từng bạn bè
    supabase
      .from("profiles")
      .select("id, name, avatar")
      .in("id", allIds)
      .then(({ data, error }) => {
        if (error) {
          setFriendProfiles([]);
          return;
        }
        // convert về mảng {id, name, avatar, online (default false)}
        const arr: FriendProfile[] = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar || null,
          online: false
        }));
        setFriendProfiles(arr);
      });
  }, [friends, myId]);

  // 2. Presence realtime: mỗi user vào app join channel theo userId của mình
  useEffect(() => {
    if (!myId) return;

    const channel = supabase.channel("friends-presence", {
      config: { presence: { key: myId } }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // Gọi khi có update trạng thái presence từ mọi người trong channel
        const state = channel.presenceState();
        // state: { [userId: string]: [{ userName: string }] }
        const ids = new Set(Object.keys(state));
        setOnlineIds(ids);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setOnlineIds(prev => new Set(prev).add(key));
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineIds(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      });

    // Đánh dấu online khi vào app
    channel.subscribe(async status => {
      if (status === "SUBSCRIBED") {
        await channel.track({});
      }
    });

    // cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId]);

  // Kết hợp profile & trạng thái online để trả ra UI
  const friendProfilesWithOnline = friendProfiles.map(f => ({
    ...f,
    online: onlineIds.has(f.id)
  }));

  return {
    friends: friendProfilesWithOnline,
    isLoading: friendsLoading
  };
}
