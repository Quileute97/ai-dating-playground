
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Activity {
  id: string;
  type: "friend" | "comment" | "like";
  text: string;
  icon: React.ReactNode;
  created_at: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  isNew?: boolean;
}

// Lấy các hoạt động của user hiện tại và bạn bè
export function useRecentActivities(userId: string | undefined) {
  return useQuery({
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

      // Lấy hoạt động kết bạn gần đây
      const { data: newFriends } = await supabase
        .from("friends")
        .select("id, user_id, friend_id, created_at, profiles:user_id(name,avatar)")
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(5);

      // Lấy hoạt động like user (like profile)
      const { data: userLikes } = await supabase
        .from("user_likes")
        .select("id, liker_id, liked_id, created_at, profiles:liker_id(name,avatar)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Lấy hoạt động like bài post gần đây
      const { data: postLikes } = await supabase
        .from("post_likes")
        .select("id, user_id, post_id, created_at, profiles:user_id(name,avatar)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Lấy bình luận mới trên bài post của bạn hoặc bạn bè
      const { data: comments } = await supabase
        .from("comments")
        .select("id, user_id, content, created_at, profiles:user_id(name,avatar)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Kết hợp - căn theo thời gian
      let all: Activity[] = [];

      // Bạn mới
      newFriends?.forEach((f: any) => {
        // Người invite
        all.push({
          id: "friend-" + f.id,
          type: "friend",
          text: `${f.profiles?.name || "Ai đó"} đã kết bạn`,
          icon: null, // set ở UI
          created_at: f.created_at,
          user_id: f.user_id,
          user_name: f.profiles?.name || null,
          user_avatar: f.profiles?.avatar || null,
        });
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

      // Like bài post
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
        });
      });

      // Bình luận
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
        });
      });

      // Sắp xếp theo thời gian mới -> cũ, lấy 8 hoạt động mới nhất
      all = all
        .filter(x => !!x.created_at)
        .sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 8);

      return all;
    }
  });
}
