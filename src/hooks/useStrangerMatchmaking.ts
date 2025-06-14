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
    console.log("[STRANGER] [joinQueue] ƯU TIÊN LOG: userId =", userId, "status =", status);
    if (!userId) {
      console.log("[STRANGER] [joinQueue] userId null, bỏ qua.");
      return;
    }

    try {
      console.log("[STRANGER] [joinQueue] Kiểm tra đã có queue chưa với userId:", userId);
      const { data: existing, error: existingError } = await supabase
        .from("stranger_queue")
        .select("id")
        .eq("user_id", userId);

      console.log("[STRANGER] [joinQueue] Kết quả get queue:", existing, existingError);

      if (existingError) {
        console.log("[STRANGER] [joinQueue] Lỗi khi kiểm tra queue:", existingError);
        setStatus("error");
        return;
      }

      if (!existing || existing.length === 0) {
        // Thêm vào queue
        const { data: inserted, error: insertError } = await supabase
          .from("stranger_queue")
          .insert([{ user_id: userId }]);

        console.log("[STRANGER] [joinQueue] Kết quả insert queue:", inserted, insertError);
        if (insertError) {
          console.log("[STRANGER] [joinQueue] Lỗi insert queue:", insertError);
          setStatus("error");
          return;
        }
      } else {
        console.log("[STRANGER] [joinQueue] Đã có trong queue, không insert lại.");
      }
      setStatus("searching");
    } catch (err) {
      console.log("[STRANGER] [joinQueue] Exception error:", err);
      setStatus("error");
    }
  }, [userId, status]);

  // Tìm ghép đôi user khác trong queue
  const tryMatch = useCallback(async () => {
    console.log("[STRANGER] [tryMatch] === POLLING === userId =", userId, "status =", status);
    if (!userId) {
      console.log("[STRANGER] [tryMatch] userId null, bỏ qua.");
      return;
    }
    try {
      const { data: queueList, error: queueError } = await supabase
        .from("stranger_queue")
        .select("user_id, created_at")
        .order("created_at", { ascending: true });

      console.log("[STRANGER] [tryMatch] Nhận queueList:", queueList, queueError);

      if (queueError) {
        console.log("[STRANGER] [tryMatch] Lỗi khi lấy queueList:", queueError);
        setStatus("error");
        return;
      }

      if (!queueList) return;

      const available = queueList.filter((item: any) => item.user_id !== userId);
      console.log("[STRANGER] [tryMatch] Những người có thể match:", available);

      if (available.length > 0) {
        // Ghép đôi thành công, tạo conversation
        const partnerId = available[0].user_id;
        console.log(`[STRANGER] [tryMatch] Ghép với ${partnerId}. Check xem đã có conversation giữa ${userId} và ${partnerId} chưa...`);

        const { data: existed, error: existedError } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(user_real_id.eq.${userId},user_fake_id.eq.${partnerId}),and(user_real_id.eq.${partnerId},user_fake_id.eq.${userId})`)
          .limit(1);

        let conversationId = null;
        if (existedError) {
          console.log("[STRANGER] [tryMatch] Lỗi kiểm tra conversation đã có chưa:", existedError);
          setStatus("error");
          return;
        }

        if (existed && existed.length > 0) {
          conversationId = existed[0].id;
          console.log("[STRANGER] [tryMatch] Đã có cuộc trò chuyện cũ, dùng id:", conversationId);
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
          console.log("[STRANGER] [tryMatch] Tạo mới conversation, data:", cCreated, createConvError);
          if (createConvError) {
            console.log("[STRANGER] [tryMatch] Lỗi tạo conversation:", createConvError);
            setStatus("error");
            return;
          }
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

        console.log("[STRANGER] [tryMatch] Đã xóa khỏi queue? delMeErr:", delMeErr, "delThemErr:", delThemErr);

        setMatchResult({ partnerId, conversationId });
        setStatus("matched");
        console.log("[STRANGER] [tryMatch] Hoàn tất MATCH! partnerId:", partnerId, "conversationId:", conversationId);
      } else {
        console.log("[STRANGER] [tryMatch] Chưa tìm thấy ai để match...");
      }
    } catch (err) {
      console.log("[STRANGER] [tryMatch] Exception error:", err);
      setStatus("error");
    }
  }, [userId, status]);

  // Poll tìm ghép đôi auto mỗi 1.5s
  useEffect(() => {
    if (status === "searching" && userId) {
      console.log("[STRANGER] [effect] Bắt đầu polling interval ghép đôi.");
      intervalRef.current = setInterval(() => {
        tryMatch();
      }, 1500);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          console.log("[STRANGER] [effect] Hủy polling interval khi ngừng tìm.");
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      console.log("[STRANGER] [effect] Đã clear interval.");
    }
  }, [status, tryMatch, userId]);

  // Khi unmount hoặc dừng tìm, tự xóa khỏi queue
  useEffect(() => {
    return () => {
      if (userId) {
        supabase.from("stranger_queue").delete().eq("user_id", userId);
        console.log("[STRANGER] [cleanup] Đã gọi xoá khỏi queue khi unmount hoặc userId thay đổi.");
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log("[STRANGER] [cleanup] Đã clear interval trong unmount.");
      }
    };
  }, [userId]);

  // Hàm reset lại về idle
  const reset = useCallback(async () => {
    console.log("[STRANGER] [reset] RESET ghép đôi, userId =", userId);
    setStatus("idle");
    setMatchResult({ partnerId: null, conversationId: null });
    if (userId) {
      const { error: delErr } = await supabase.from("stranger_queue").delete().eq("user_id", userId);
      console.log("[STRANGER] [reset] Đã gọi xoá khỏi queue khi reset. Lỗi:", delErr);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      console.log("[STRANGER] [reset] Đã clear interval trong reset.");
    }
  }, [userId]);

  return {
    status,
    matchResult,
    joinQueue,
    reset,
  };
}
