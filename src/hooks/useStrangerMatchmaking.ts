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

  // Hàm xóa mọi user ảo khỏi queue
  const removeAllAnonymousFromQueue = useCallback(async () => {
    // Lấy tất cả các user_id không phải UUIDv4 khỏi queue và xóa hết
    const { data: queueList, error } = await supabase
      .from("stranger_queue")
      .select("user_id");
    if (!queueList) return;
    const anonIds = queueList
      .filter((item: any) => !isUUIDv4(item.user_id))
      .map((item: any) => item.user_id);

    if (anonIds.length > 0) {
      console.log("[STRANGER] [removeAllAnonymousFromQueue] Đang xoá user ảo khỏi queue:", anonIds);
      await supabase.from("stranger_queue").delete().in("user_id", anonIds);
    }
  }, []);

  // Thêm user vào hàng chờ: chỉ cho user thật (UUID v4)
  const joinQueue = useCallback(async () => {
    console.log("[STRANGER] [joinQueue] userId =", userId, "status =", status);
    // Xoá mọi user ảo khỏi queue trước khi thao tác tiếp
    await removeAllAnonymousFromQueue();

    if (!userId || !isUUIDv4(userId)) {
      console.log("[STRANGER] [joinQueue] chỉ cho UUIDv4 (user thật) vào hàng chờ. Bỏ qua user anonymous.");
      setStatus("error");
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
  }, [userId, status, removeAllAnonymousFromQueue]);

  // Poll tìm ghép đôi: sửa lại logic để cả 2 client đều được thông báo
  const tryMatch = useCallback(async () => {
    console.log("[STRANGER] [tryMatch] POLLING userId =", userId, "status =", status);
    if (!userId || !isUUIDv4(userId)) {
      console.log("[STRANGER] [tryMatch] userId không hợp lệ hoặc không phải UUIDv4. Không tìm match.");
      return;
    }
    try {
      // Xóa mọi user ảo nếu vẫn còn trong queue
      await removeAllAnonymousFromQueue();

      const { data: queueList, error: queueError } = await supabase
        .from("stranger_queue")
        .select("user_id, created_at")
        .order("created_at", { ascending: true });

      if (queueError) {
        setStatus("error");
        return;
      }
      if (!queueList) return;

      const amIInQueue = queueList.some(item => item.user_id === userId);
      const others = queueList.filter((item: any) => item.user_id !== userId && isUUIDv4(item.user_id));
      
      if (others.length > 0) {
        // CASE 1: I am the MATCHER. I found someone.
        const partnerId = others[0].user_id;
        console.log("[STRANGER] [tryMatch] Found partner, I am the matcher:", partnerId);

        // Check if conversation already exists to prevent race conditions
        const { data: existed, error: existedError } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(user_real_id.eq.${userId},user_fake_id.eq.${partnerId}),and(user_real_id.eq.${partnerId},user_fake_id.eq.${userId})`)
          .limit(1);
        
        if (existedError) {
          setStatus("error");
          return;
        }

        if (existed && existed.length > 0) {
          console.log('[STRANGER] [tryMatch] Conversation already exists, another client was faster. Let them handle it.');
          return;
        }

        // Create conversations for both users so RLS works
        const { data: c1, error: e1 } = await supabase
            .from("conversations")
            .insert([{ user_real_id: userId, user_fake_id: partnerId }])
            .select("id")
            .single();
        const { error: e2 } = await supabase
            .from("conversations")
            .insert([{ user_real_id: partnerId, user_fake_id: userId }]);

        if (e1 || e2) {
            console.error('[STRANGER] [tryMatch] Error creating conversations', e1, e2);
            setStatus("error");
            return;
        }
        
        // Matched! Remove myself from queue and update state.
        // The other user will be responsible for removing themselves.
        await supabase.from("stranger_queue").delete().eq("user_id", userId);
        setMatchResult({ partnerId, conversationId: c1.id });
        setStatus("matched");

      } else if (amIInQueue) {
        // CASE 2: I am in queue, but found no one else. Maybe someone matched me?
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('id, user_fake_id, created_at')
          .eq('user_real_id', userId) // Check for convos where I am the "real" user
          .order('created_at', { ascending: false })
          .limit(1);

        if (convError) return;

        if (conv && conv.length > 0) {
          const recentConv = conv[0];
          const timeSinceCreation = Date.now() - new Date(recentConv.created_at).getTime();

          // If created in the last 10 seconds, assume it's our match
          if (timeSinceCreation < 10000) {
            console.log('[STRANGER] [tryMatch] Found recent conversation, assuming I was matched by another user.', recentConv);
            await supabase.from("stranger_queue").delete().eq("user_id", userId);
            setMatchResult({ partnerId: recentConv.user_fake_id, conversationId: recentConv.id });
            setStatus("matched");
          }
        }
      }
    } catch (err) {
      console.error('[STRANGER] [tryMatch] General exception:', err);
      setStatus("error");
    }
  }, [userId, status, removeAllAnonymousFromQueue]);

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
