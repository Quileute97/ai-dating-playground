import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Hàm kiểm tra ID có đúng UUID v4 hay không
function isUUIDv4(id: string) {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return !!id && UUID_REGEX.test(id);
}

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

  // Tìm ghép đôi user khác trong queue, ƯU TIÊN user thật với nhau
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

      if (queueError) {
        setStatus("error");
        return;
      }
      if (!queueList) return;

      // Loại bỏ chính mình khỏi queue
      const available = queueList.filter((item: any) => item.user_id !== userId);
      // Phân nhóm: user thật (UUID v4) và anonymous (id không phải UUID v4)
      const realUsers = available.filter((i: any) => isUUIDv4(i.user_id));
      const anonUsers = available.filter((i: any) => !isUUIDv4(i.user_id));

      let partnerId: string | null = null;
      if (realUsers.length > 0) {
        // Ưu tiên ghép với user thật trước
        partnerId = realUsers[0].user_id;
        console.log("[STRANGER] [tryMatch] Ưu tiên match với user thật:", partnerId);
      } else if (anonUsers.length > 0) {
        // Nếu không có user thật, ghép với anonymous
        partnerId = anonUsers[0].user_id;
        console.log("[STRANGER] [tryMatch] Không có user thật, match với anonymous:", partnerId);
      } else {
        console.log("[STRANGER] [tryMatch] Không tìm thấy ai để match...");
        return;
      }

      // Tìm conversation giữa userId và partnerId (check cả 2 chiều)
      const { data: existed, error: existedError } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(user_real_id.eq.${userId},user_fake_id.eq.${partnerId}),and(user_real_id.eq.${partnerId},user_fake_id.eq.${userId})`)
        .limit(1);

      let conversationId = null;
      if (existedError) {
        setStatus("error");
        return;
      }

      if (existed && existed.length > 0) {
        conversationId = existed[0].id;
      } else {
        // Khi match giữa 2 user thật, cho phép gán user_real_id, user_fake_id đều là UUID
        // Để cả 2 đều xem được conversation, sẽ insert 2 chiều (mỗi người là real ở 1 bản ghi)
        let cCreated = null;
        let createConvError = null;
        if (isUUIDv4(userId) && isUUIDv4(partnerId)) {
          // Ghép 2 user thật -> tạo 2 conversation mirror
          const { data: c1, error: e1 } = await supabase
            .from("conversations")
            .insert([{ user_real_id: userId, user_fake_id: partnerId }])
            .select("id")
            .single();
          const { data: c2, error: e2 } = await supabase
            .from("conversations")
            .insert([{ user_real_id: partnerId, user_fake_id: userId }])
            .select("id");
          cCreated = c1; // chỉ trả về id của userId bản ghi đầu
          createConvError = e1 || e2;
          conversationId = c1?.id;
        } else {
          // 1 bên là user thật, 1 bên là anonymous (hoặc fake)
          const { data: c, error: e } = await supabase
            .from("conversations")
            .insert([{ user_real_id: userId, user_fake_id: partnerId }])
            .select("id")
            .single();
          cCreated = c;
          createConvError = e;
          conversationId = c?.id;
        }
        if (createConvError) {
          setStatus("error");
          return;
        }
      }

      // Xóa 2 user khỏi queue
      await supabase.from("stranger_queue").delete().eq("user_id", userId);
      await supabase.from("stranger_queue").delete().eq("user_id", partnerId);

      setMatchResult({ partnerId, conversationId });
      setStatus("matched");
    } catch (err) {
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
