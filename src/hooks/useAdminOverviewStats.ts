
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Trả về các số liệu tổng quan cho dashboard
export function useAdminOverviewStats() {
  return useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async () => {
      // Đếm tổng số người dùng
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      // Đếm tổng số cuộc hội thoại AI (giả định conversations có user_fake_id != null là chat AI)
      const { data: aiChats, error: aiChatsError } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true });
      // Đếm tổng số matches nếu có bảng matches
      let matchesCount = 0;
      try {
        const { count: matches } = await supabase
          .from("matches")
          .select("id", { count: "exact", head: true });
        matchesCount = matches || 0;
      } catch {
        matchesCount = 0;
      }
      // Số người online sẽ lấy được nếu có trường last_active hoặc status, ở đây để ước lượng = số user trong 5 phút gần nhất
      let onlineCount = 0;
      try {
        const { count: online } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("last_active", new Date(Date.now() - 5 * 60 * 1000).toISOString());
        onlineCount = online || 0;
      } catch {
        onlineCount = 0;
      }

      return {
        userCount: typeof users?.count === "number" ? users.count : 0,
        aiChats: typeof aiChats?.count === "number" ? aiChats.count : 0,
        matches: matchesCount,
        onlineCount: onlineCount,
      };
    },
    staleTime: 60_000,
  });
}
