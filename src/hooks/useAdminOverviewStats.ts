
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

      // Nếu cần đếm user, hãy tạo bảng user/profiles riêng trong database
      // Tạm thời số lượng đặt cứng về 0
      // Nếu bạn bổ sung bảng "profiles", mình sẽ cập nhật lại
      let userCount = 0;
      let matches = 0;
      let onlineCount = 0; // Tạm thời
      // TODO: Hướng dẫn bổ sung nếu có nhu cầu

      return {
        userCount,
        aiChats,
        matches,
        upgradeRequests,
        onlineCount,
      };
    },
    staleTime: 60_000,
  });
}
