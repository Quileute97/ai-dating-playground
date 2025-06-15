import { useState, useEffect, useRef } from "react";
import { 
  joinStrangerQueue, 
  leaveStrangerQueue, 
  findMatch, 
  checkForExistingMatch, 
  createConversation 
} from "@/services/strangerMatchmakingService";

export function useStrangerMatchmaking() {
  const [isInQueue, setIsInQueue] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<number | null>(null);
  const userIdRef = useRef<string | null>(null);

  const startQueue = async (userId: string) => {
    console.log("[STRANGER] [startQueue] userId =", userId, "Type:", typeof userId);

    if (!userId) {
      setError("No user ID provided");
      return;
    }

    try {
      setError(null);
      userIdRef.current = userId;
      
      // Check for existing recent match first
      const existingMatch = await checkForExistingMatch(userId);
      if (existingMatch) {
        console.log("[STRANGER] Found existing recent match:", existingMatch);
        setPartnerId(existingMatch.partnerId);
        setConversationId(existingMatch.conversationId);
        setIsMatched(true);
        setIsInQueue(false);
        console.log("[STRANGER] [startQueue] Early exit: Found recent match, set matched");
        // Polling không cần thiết nếu đã match
        return;
      }

      // Join queue
      await joinStrangerQueue(userId);
      console.log("[STRANGER] [startQueue] Successfully joined queue");
      setIsInQueue(true);

      // Start polling for matches
      console.log("[STRANGER] Starting polling for matches");
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = window.setInterval(async () => {
        console.log(
          "[STRANGER] [polling] Queue state:",
          {
            isMatched,
            isInQueue,
            partnerId,
            conversationId,
            error,
            userIdRef: userIdRef.current,
            now: new Date().toISOString(),
          }
        );
        // NOTE: Không rely vào biến isMatched ở closure, luôn truy cập từ state mới nhất hoặc kiểm tra lại trực tiếp!
        // CLIP: Nếu đã có partnerId và conversationId => đã match thành công (chủ động hoặc bị động)
        let latestUserId = userIdRef.current;
        if (!latestUserId) {
          // Khi reset state queue
          console.log("[STRANGER][POLL][ABORT] userIdRef null, stop polling");
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          return;
        }
        // Luôn luôn check trực tiếp từ backend để phòng trường hợp setState bị trễ!
        const exist = await checkForExistingMatch(latestUserId);
        if (exist && exist.partnerId && exist.conversationId) {
          setPartnerId(exist.partnerId);
          setConversationId(exist.conversationId);
          setIsMatched(true);
          setIsInQueue(false);
          // Dừng polling ngay lập tức khi đã match thành công!
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          // Xóa khỏi queue
          await leaveStrangerQueue(latestUserId);
          console.log("[STRANGER][POLL] Đã matched (manual polling), stop và chuyển UI!");
          return;
        }
        // Nếu chưa matched, thực hiện tryMatch như cũ
        await tryMatch(latestUserId);
      }, 1500); // Check every 1.5 seconds

    } catch (err) {
      console.error("[STRANGER] [startQueue] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to join queue");
    }
  };

  const tryMatch = async (userId: string) => {
    try {
      console.log("[STRANGER][tryMatch] Đang polling tìm ghép đôi cho:", userId, new Date().toISOString());

      // Luôn check lại match ở backend, không rely vào state!
      const existingMatch = await checkForExistingMatch(userId);

      if (existingMatch && existingMatch.partnerId && existingMatch.conversationId) {
        setPartnerId(existingMatch.partnerId);
        setConversationId(existingMatch.conversationId);
        setIsMatched(true);
        setIsInQueue(false);
        await leaveStrangerQueue(userId);

        // Dừng polling luôn!
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        console.log("[STRANGER] Matched phía bị động (tryMatch): đã cập nhật UI!");
        return;
      }

      // Nếu chưa có conversation, thử chủ động match
      const partner = await findMatch(userId);
      if (partner) {
        const result = await createConversation(userId, partner);
        if (result && result.conversationId) {
          setPartnerId(partner);
          setConversationId(result.conversationId);
          setIsMatched(true);
          setIsInQueue(false);
          await leaveStrangerQueue(userId);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          console.log("[STRANGER] Matched phía chủ động, đã cập nhật UI!");
          return;
        }
      }
      // Nếu vẫn không thấy, vẫn giữ ở hàng chờ!
    } catch (err) {
      console.error("[STRANGER][tryMatch][ERR]", err);
      setError(err instanceof Error ? err.message : "Matching failed");
    }
  };

  const stopQueue = async () => {
    console.log("[STRANGER] [stopQueue] Stopping queue");

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log("[STRANGER] Stopping polling");
    }

    if (userIdRef.current) {
      await leaveStrangerQueue(userIdRef.current);
    }

    setIsInQueue(false);
    setIsMatched(false);
    setPartnerId(null);
    setConversationId(null);
    setError(null);
    userIdRef.current = null;
  };

  const reset = () => {
    console.log("[STRANGER] [reset] Resetting matchmaking state");

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    setIsInQueue(false);
    setIsMatched(false);
    setPartnerId(null);
    setConversationId(null);
    setError(null);
    userIdRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (userIdRef.current) {
        leaveStrangerQueue(userIdRef.current);
      }
    };
  }, []);

  return {
    isInQueue,
    isMatched,
    partnerId,
    conversationId,
    error,
    startQueue,
    stopQueue,
    reset,
  };
}
