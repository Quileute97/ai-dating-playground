
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Trả về các số liệu tổng quan cho dashboard (dựa trên bảng hiện có)
export function useAdminOverviewStats() {
  return useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async () => {
      // Đếm số cuộc hội thoại AI (conversations)
      const { count: aiChats = 0 } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true });

      // Đếm số yêu cầu nâng cấp
      const { count: upgradeRequests = 0 } = await supabase
        .from("upgrade_requests")
        .select("id", { count: "exact", head: true });

      // Đếm số người dùng thật từ bảng profiles
      const { count: userCount = 0 } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // Đếm số matches (user_likes)
      const { count: matches = 0 } = await supabase
        .from("user_likes")
        .select("id", { count: "exact", head: true });

      // Đếm số người dùng online (active trong 5 phút gần nhất)
      const { count: onlineCount = 0 } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("last_active", new Date(Date.now() - 5 * 60 * 1000).toISOString());

      // Lấy hoạt động gần đây từ posts và conversations
      const { data: recentPosts } = await supabase
        .from("posts")
        .select("created_at, user_id, content")
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: recentConversations } = await supabase
        .from("conversations")
        .select("created_at, user_real_id")
        .order("created_at", { ascending: false })
        .limit(2);

      const recentActivities = [
        ...(recentPosts || []).map(post => ({
          type: "Bài đăng mới",
          description: `Người dùng đăng bài: "${post.content?.substring(0, 50)}..."`,
          time: new Date(post.created_at).toLocaleString('vi-VN')
        })),
        ...(recentConversations || []).map(conv => ({
          type: "Cuộc trò chuyện mới",
          description: "Cuộc trò chuyện mới được tạo",
          time: new Date(conv.created_at).toLocaleString('vi-VN')
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      return {
        userCount,
        aiChats,
        matches,
        upgradeRequests,
        onlineCount,
        recentActivities,
      };
    },
    staleTime: 60_000,
  });
}
