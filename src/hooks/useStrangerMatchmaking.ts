
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
    if (!userId) {
      console.log("[joinQueue] userId null, bỏ qua.");
      return;
    }

    console.log(`[joinQueue] userId: ${userId} - Kiểm tra đã có queue chưa...`);
    const { data: existing, error: existingError } = await supabase
      .from("stranger_queue")
      .select("id")
      .eq("user_id", userId);

    console.log("[joinQueue] Kết quả get queue:", existing, existingError);

    if (!existing || existing.length === 0) {
      // Thêm vào queue
      const { data: inserted, error: insertError } = await supabase
        .from("stranger_queue")
        .insert([{ user_id: userId }]);
      console.log("[joinQueue] Kết quả insert queue:", inserted, insertError);
    } else {
      console.log("[joinQueue] Đã có trong queue, không insert lại.");
    }
    setStatus("searching");
  }, [userId]);

  // Tìm ghép đôi user khác trong queue
  const tryMatch = useCallback(async () => {
    if (!userId) {
      console.log("[tryMatch] userId null, bỏ qua.");
      return;
    }
    // Lấy tất cả user trong queue, loại trừ bản thân
    const { data: queueList, error: queueError } = await supabase
      .from("stranger_queue")
      .select("user_id, created_at")
      .order("created_at", { ascending: true });

    console.log(`[tryMatch] Polling, nhận queueList:`, queueList, queueError);

    if (!queueList) return;

    const available = queueList.filter((item: any) => item.user_id !== userId);
    console.log(`[tryMatch] Những người có thể match:`, available);

    if (available.length > 0) {
      // Ghép đôi thành công, tạo conversation
      const partnerId = available[0].user_id;
      console.log(`[tryMatch] Ghép với: ${partnerId}. Check xem đã có conversation giữa ${userId} và ${partnerId} chưa...`);

      const { data: existed, error: existedError } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(user_real_id.eq.${userId},user_fake_id.eq.${partnerId}),and(user_real_id.eq.${partnerId},user_fake_id.eq.${userId})`)
        .limit(1);

      let conversationId = null;
      if (existed && existed.length > 0) {
        conversationId = existed[0].id;
        console.log("[tryMatch] Đã có cuộc trò chuyện cũ, dùng id:", conversationId);
      } else {
        const { data: cCreated, error: createConvError } = await supabase
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
        console.log("[tryMatch] Tạo mới conversation, data:", cCreated, createConvError);
      }

      // Xóa 2 user khỏi queue
      const { error: delMeErr } = await supabase
        .from("stranger_queue")
        .delete()
        .eq("user_id", userId);
      const { error: delThemErr } = await supabase
        .from("stranger_queue")
        .delete()
        .eq("user_id", partnerId);

      console.log(`[tryMatch] Đã xóa khỏi queue? delMeErr:`, delMeErr, "delThemErr:", delThemErr);

      setMatchResult({ partnerId, conversationId });
      setStatus("matched");
      console.log(`[tryMatch] Hoàn tất MATCH! partnerId: ${partnerId}, conversationId: ${conversationId}`);
    } else {
      console.log("[tryMatch] Chưa tìm thấy ai để match...");
    }
  }, [userId]);

  // Bắt đầu tìm và ghép đôi auto mỗi 1.5s
  useEffect(() => {
    if (status === "searching" && userId) {
      console.log("[effect] Bắt đầu polling interval ghép đôi.");
      intervalRef.current = setInterval(() => {
        tryMatch();
      }, 1500);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          console.log("[effect] Hủy polling interval khi ngừng tìm.");
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      console.log("[effect] Đã clear interval.");
    }
  }, [status, tryMatch, userId]);

  // Khi unmount hoặc dừng tìm, tự xóa khỏi queue
  useEffect(() => {
    return () => {
      if (userId) {
        supabase.from("stranger_queue").delete().eq("user_id", userId);
        console.log("[cleanup] Đã gọi xoá khỏi queue khi unmount hoặc userId thay đổi.");
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log("[cleanup] Đã clear interval trong unmount.");
      }
    };
  }, [userId]);

  // Hàm reset lại về idle
  const reset = useCallback(async () => {
    setStatus("idle");
    setMatchResult({ partnerId: null, conversationId: null });
    if (userId) {
      const { error: delErr } = await supabase.from("stranger_queue").delete().eq("user_id", userId);
      console.log("[reset] Đã gọi xoá khỏi queue khi reset. Lỗi:", delErr);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      console.log("[reset] Đã clear interval trong reset.");
    }
  }, [userId]);

  return {
    status,
    matchResult,
    joinQueue,
    reset,
  };
}

