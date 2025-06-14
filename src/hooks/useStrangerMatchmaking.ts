
import { useState, useCallback, useEffect, useRef } from "react";
import {
  joinStrangerQueue,
  leaveStrangerQueue,
  findMatch,
  createConversation,
  checkForExistingMatch,
} from "@/services/strangerMatchmakingService";
import { isUUIDv4 } from "@/utils/uuidUtils";

interface MatchResult {
  partnerId: string | null;
  conversationId: string | null;
}

type Status = "idle" | "searching" | "matched" | "error";

export function useStrangerMatchmaking(userId: string | null) {
  const [status, setStatus] = useState<Status>("idle");
  const [matchResult, setMatchResult] = useState<MatchResult>({ partnerId: null, conversationId: null });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const joinQueue = useCallback(async () => {
    console.log("[STRANGER] [joinQueue] userId =", userId);
    if (!isUUIDv4(userId)) {
      console.error("[STRANGER] [joinQueue] Invalid user ID. Aborting.");
      setStatus("error");
      return;
    }
    try {
      setStatus("searching");
      await joinStrangerQueue(userId);
    } catch (err) {
      console.error("[STRANGER] [joinQueue] Exception error:", err);
      setStatus("error");
    }
  }, [userId]);

  const tryMatch = useCallback(async () => {
    if (!isUUIDv4(userId)) return;

    try {
      // Case 1: I am the matcher. Look for someone in the queue.
      const partnerId = await findMatch(userId);
      if (partnerId) {
        console.log("[STRANGER] [tryMatch] Found partner, attempting to create conversation:", partnerId);
        const conversation = await createConversation(userId, partnerId);
        if (conversation) {
          await leaveStrangerQueue(userId);
          setMatchResult({ partnerId, conversationId: conversation.conversationId });
          setStatus("matched");
        }
        return;
      }

      // Case 2: No one found. Check if someone else matched with me.
      const existingMatch = await checkForExistingMatch(userId);
      if (existingMatch) {
        console.log('[STRANGER] [tryMatch] Found recent conversation, assuming I was matched.', existingMatch);
        await leaveStrangerQueue(userId);
        setMatchResult(existingMatch);
        setStatus("matched");
      }
    } catch (err) {
      console.error('[STRANGER] [tryMatch] General exception:', err);
      setStatus("error");
    }
  }, [userId]);

  // Polling for a match
  useEffect(() => {
    if (status === "searching" && userId) {
      intervalRef.current = setInterval(tryMatch, 1500);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [status, userId, tryMatch]);

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (userId && isUUIDv4(userId)) {
        leaveStrangerQueue(userId);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  const reset = useCallback(async () => {
    setStatus("idle");
    setMatchResult({ partnerId: null, conversationId: null });
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (userId && isUUIDv4(userId)) {
      await leaveStrangerQueue(userId);
    }
  }, [userId]);

  return { status, matchResult, joinQueue, reset };
}
