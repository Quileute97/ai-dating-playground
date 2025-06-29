
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface Activity {
  id: string;
  type: "friend" | "comment" | "like" | "friend_request";
  text: string;
  icon: React.ReactNode;
  created_at: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  post_id?: string; // Thêm field này để lưu ID bài viết
  friend_request_id?: string; // Thêm field này để lưu ID lời mời kết bạn
  isNew?: boolean;
}

// Lấy các hoạt động của user hiện tại và bạn bè
export function useRecentActivities(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["recent-activities", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      
      // Lấy danh sách bạn bè được chấp nhận
      const { data: friends, error: e1 } = await supabase
        .from("friends")
        .select("user_id, friend_id, accepted_at, created_at")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");
      if (e1) throw e1;
      const friendIds = Array.from(
        new Set([
          ...friends.map((f: any) => f.user_id),
          ...friends.map((f: any) => f.friend_id),
          userId,
        ])
      );

      // Lấy hoạt động kết bạn gần đây (chỉ những người đã kết bạn)
      const { data: newFriends } = await supabase
        .from("friends")
        .select("id, user_id, friend_id, created_at, profiles:user_id(name,avatar)")
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(5);

      // Lấy TẤT CẢ lời mời kết bạn pending (cả gửi và nhận)
      const { data: allFriendRequests } = await supabase
        .from("friends")
        .select("id, user_id, friend_id, created_at, profiles:user_id(name,avatar)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      // Lấy hoạt động like user (like profile)
      const { data: userLikes } = await supabase
        .from("user_likes")
        .select("id, liker_id, liked_id, created_at, profiles:liker_id(name,avatar)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Lấy hoạt động like bài post gần đây - bao gồm post_id
      const { data: postLikes } = await supabase
        .from("post_likes")
        .select("id, user_id, post_id, created_at, profiles:user_id(name,avatar)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Lấy bình luận mới trên bài post của bạn hoặc bạn bè - bao gồm post_id
      const { data: comments } = await supabase
        .from("comments")
        .select("id, user_id, post_id, content, created_at, profiles:user_id(name,avatar)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Kết hợp - căn theo thời gian
      let all: Activity[] = [];

      // Bạn mới (đã chấp nhận)
      newFriends?.forEach((f: any) => {
        all.push({
          id: "friend-" + f.id,
          type: "friend",
          text: `${f.profiles?.name || "Ai đó"} đã kết bạn`,
          icon: null,
          created_at: f.created_at,
          user_id: f.user_id,
          user_name: f.profiles?.name || null,
          user_avatar: f.profiles?.avatar || null,
        });
      });

      // Lời mời kết bạn - hiển thị TẤT CẢ lời mời (cả gửi và nhận)
      allFriendRequests?.forEach((f: any) => {
        const isReceived = f.friend_id === userId;
        const issent = f.user_id === userId;
        
        if (isReceived) {
          // Lời mời nhận được
          all.push({
            id: "friend-request-received-" + f.id,
            type: "friend_request",
            text: `${f.profiles?.name || "Ai đó"} đã gửi lời mời kết bạn`,
            icon: null,
            created_at: f.created_at,
            user_id: f.user_id,
            user_name: f.profiles?.name || null,
            user_avatar: f.profiles?.avatar || null,
            friend_request_id: f.id,
          });
        } else if (isReceived || isReceived) {
          // Có thể hiển thị cả lời mời đã gửi (tùy chọn)
          // Bỏ comment dòng dưới nếu muốn hiển thị lời mời đã gửi
          // all.push({...})
        }
      });

      // Like profile
      userLikes?.forEach((l: any) => {
        all.push({
          id: "likeuser-" + l.id,
          type: "like",
          text: `${l.profiles?.name || "Ai đó"} đã thích hồ sơ ai đó`,
          icon: null,
          created_at: l.created_at ?? "",
          user_id: l.liker_id,
          user_name: l.profiles?.name || null,
          user_avatar: l.profiles?.avatar || null,
        });
      });

      // Like bài post - bao gồm post_id
      postLikes?.forEach((l: any) => {
        all.push({
          id: "likepost-" + l.id,
          type: "like",
          text: `${l.profiles?.name || "Ai đó"} vừa like 1 bài post`,
          icon: null,
          created_at: l.created_at ?? "",
          user_id: l.user_id,
          user_name: l.profiles?.name || null,
          user_avatar: l.profiles?.avatar || null,
          post_id: l.post_id, // Lưu post_id
        });
      });

      // Bình luận - bao gồm post_id
      comments?.forEach((c: any) => {
        all.push({
          id: "comment-" + c.id,
          type: "comment",
          text: `${c.profiles?.name || "Ai đó"}: "${c.content}"`,
          icon: null,
          created_at: c.created_at ?? "",
          user_id: c.user_id,
          user_name: c.profiles?.name || null,
          user_avatar: c.profiles?.avatar || null,
          post_id: c.post_id, // Lưu post_id
        });
      });

      // Sắp xếp theo thời gian mới -> cũ, lấy 12 hoạt động mới nhất (tăng từ 8 lên 12)
      all = all
        .filter(x => !!x.created_at)
        .sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 12);

      console.log('🎯 Recent activities loaded:', all);
      return all;
    }
  });

  // Realtime subscription cho activities
  useEffect(() => {
    if (!userId) return;

    const channels = [
      supabase.channel('activities-friends').on('postgres_changes', {
        event: '*', schema: 'public', table: 'friends'
      }, (payload) => {
        console.log('🔄 Friends table changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["recent-activities", userId] });
      }),

      supabase.channel('activities-user-likes').on('postgres_changes', {
        event: '*', schema: 'public', table: 'user_likes'
      }, () => queryClient.invalidateQueries({ queryKey: ["recent-activities", userId] })),

      supabase.channel('activities-post-likes').on('postgres_changes', {
        event: '*', schema: 'public', table: 'post_likes'
      }, () => queryClient.invalidateQueries({ queryKey: ["recent-activities", userId] })),

      supabase.channel('activities-comments').on('postgres_changes', {
        event: '*', schema: 'public', table: 'comments'
      }, () => queryClient.invalidateQueries({ queryKey: ["recent-activities", userId] }))
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, queryClient]);

  return query;
}
