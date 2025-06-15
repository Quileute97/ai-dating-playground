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
        // KHÔNG dừng polling quá sớm: Polling chỉ dừng nếu vừa được matched thành công (setIsMatched)
        if (!userIdRef.current) {
          // Khi reset state queue
          console.log("[STRANGER] [polling] userIdRef null -> stop polling");
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          return;
        }
        if (isMatched) {
          // Chỉ dừng khi thật sự đã set matched (phải luôn update state trước khi clearInterval)
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          console.log("[STRANGER] [polling] Stopped polling because isMatched=true");
          return;
        }
        // Nếu state stuck, vẫn tiếp tục polling để không bị 'kẹp'
        await tryMatch(userIdRef.current);
      }, 1500); // Check every 1.5 seconds

    } catch (err) {
      console.error("[STRANGER] [startQueue] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to join queue");
    }
  };

  const tryMatch = async (userId: string) => {
    try {
      console.log("[STRANGER] [tryMatch] Polling for userId:", userId, "at", new Date().toISOString());

      // NEW: Luôn checkForExistingMatch, kể cả khi là người bị động!
      const existingMatch = await checkForExistingMatch(userId);
      console.log("[STRANGER] [tryMatch] checkForExistingMatch returns:", existingMatch);

      if (existingMatch) {
        // Đã có người tạo conversation với mình!
        setPartnerId(existingMatch.partnerId);
        setConversationId(existingMatch.conversationId);
        setIsMatched(true);
        setIsInQueue(false);

        // Remove khỏi queue và stop polling
        await leaveStrangerQueue(userId);

        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        console.log("[STRANGER] Matched (bị động) (tryMatch), chuyển sang chat!");
        return;
      }

      // Nếu chưa có conversation, thử chủ động tìm match (match với người khác)
      const partner = await findMatch(userId);
      if (partner) {
        console.log("[STRANGER] [tryMatch] Found partner in queue:", partner);
        
        // Create conversation
        const result = await createConversation(userId, partner);
        if (result) {
          setPartnerId(partner);
          setConversationId(result.conversationId);
          setIsMatched(true);
          setIsInQueue(false);

          // Chỉ gọi leaveStrangerQueue với userId local (KHÔNG gọi với partner)
          await leaveStrangerQueue(userId);

          // Stop polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          console.log("[STRANGER] Matched (chủ động), chuyển sang chat!");
        }
      } else {
        // Không có ai, vẫn tiếp tục ở hàng chờ!
        console.log("[STRANGER] [tryMatch] Không tìm thấy partner, tiếp tục tìm kiếm...");
      }
    } catch (err) {
      console.error("[STRANGER] [tryMatch] Error:", err);
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
