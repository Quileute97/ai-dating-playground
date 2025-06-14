
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface MatchResult {
  partnerId: string | null;
  conversationId: string | null;
}

type Status = "idle" | "searching" | "matched" | "error";

export function useStrangerMatchmaking(userId: string | null) {
  const [status, setStatus] = useState<Status>("idle");
  const [matchResult, setMatchResult] = useState<MatchResult>({ partnerId: null, conversationId: null });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Thêm user vào hàng chờ
  const joinQueue = useCallback(async () => {
    if (!userId) return;

    // Kiểm tra đã có trong queue chưa
    const { data: existing } = await supabase
      .from("stranger_queue")
      .select("id")
      .eq("user_id", userId);

    if (!existing || existing.length === 0) {
      // Thêm vào queue
      await supabase
        .from("stranger_queue")
        .insert([{ user_id: userId }]);
    }
    setStatus("searching");
  }, [userId]);

  // Tìm ghép đôi user khác trong queue
  const tryMatch = useCallback(async () => {
    if (!userId) return;
    // Lấy tất cả user trong queue, loại trừ bản thân
    const { data: queueList } = await supabase
      .from("stranger_queue")
      .select("user_id, created_at")
      .order("created_at", { ascending: true });
    if (!queueList) return;

    const available = queueList.filter((item: any) => item.user_id !== userId);
    if (available.length > 0) {
      // Ghép đôi thành công, tạo conversation
      const partnerId = available[0].user_id;
      // Kiểm tra đã có conversation nào giữa 2 người chưa
      const { data: existed } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(user_real_id.eq.${userId},user_fake_id.eq.${partnerId}),and(user_real_id.eq.${partnerId},user_fake_id.eq.${userId})`)
        .limit(1);
      let conversationId = null;
      if (existed && existed.length > 0) {
        conversationId = existed[0].id;
      } else {
        const { data: cCreated } = await supabase
          .from("conversations")
          .insert([
            {
              user_real_id: userId,
              user_fake_id: partnerId,
            }
          ])
          .select("id")
          .single();
        conversationId = cCreated?.id;
      }

      // Xóa 2 user khỏi queue
      await supabase
        .from("stranger_queue")
        .delete()
        .eq("user_id", userId);
      await supabase
        .from("stranger_queue")
        .delete()
        .eq("user_id", partnerId);

      setMatchResult({ partnerId, conversationId });
      setStatus("matched");
    }
  }, [userId]);

  // Bắt đầu tìm và ghép đôi auto mỗi 1.5s
  useEffect(() => {
    if (status === "searching" && userId) {
      intervalRef.current = setInterval(() => {
        tryMatch();
      }, 1500);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [status, tryMatch, userId]);

  // Khi unmount hoặc dừng tìm, tự xóa khỏi queue
  useEffect(() => {
    return () => {
      if (userId) {
        supabase.from("stranger_queue").delete().eq("user_id", userId);
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);

  // Hàm reset lại về idle
  const reset = useCallback(async () => {
    setStatus("idle");
    setMatchResult({ partnerId: null, conversationId: null });
    if (userId) {
      await supabase.from("stranger_queue").delete().eq("user_id", userId);
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [userId]);

  return {
    status,
    matchResult,
    joinQueue,
    reset,
  };
}
