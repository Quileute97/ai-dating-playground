
import { useState, useCallback, useEffect, useRef } from "react";
import {
  joinStrangerQueue,
  leaveStrangerQueue,
  findMatch,
  createConversation,
  checkForExistingMatch,
} from "@/services/strangerMatchmakingService";

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
    console.log("[STRANGER] [joinQueue] userId =", userId, "Type:", typeof userId);
    
    if (!userId) {
      console.error("[STRANGER] [joinQueue] No user ID provided. Aborting.");
      setStatus("error");
      return;
    }
    
    try {
      setStatus("searching");
      await joinStrangerQueue(userId);
      console.log("[STRANGER] [joinQueue] Successfully joined queue");
    } catch (err) {
      console.error("[STRANGER] [joinQueue] Exception error:", err);
      setStatus("error");
    }
  }, [userId]);

  const tryMatch = useCallback(async () => {
    if (!userId) {
      console.log("[STRANGER] [tryMatch] No userId, skipping");
      return;
    }

    console.log("[STRANGER] [tryMatch] Attempting to find match for:", userId);

    try {
      // Case 1: I am the matcher. Look for someone in the queue.
      const partnerId = await findMatch(userId);
      console.log("[STRANGER] [tryMatch] Found partner in queue:", partnerId);
      
      if (partnerId) {
        console.log("[STRANGER] [tryMatch] Found partner, attempting to create conversation:", partnerId);
        const conversation = await createConversation(userId, partnerId);
        if (conversation) {
          console.log("[STRANGER] [tryMatch] Conversation created:", conversation);
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
      } else {
        console.log('[STRANGER] [tryMatch] No match found, continuing to search...');
      }
    } catch (err) {
      console.error('[STRANGER] [tryMatch] General exception:', err);
      setStatus("error");
    }
  }, [userId]);

  // Polling for a match
  useEffect(() => {
    if (status === "searching" && userId) {
      console.log("[STRANGER] Starting polling for matches");
      intervalRef.current = setInterval(tryMatch, 2000); // Slightly longer interval
      return () => {
        if (intervalRef.current) {
          console.log("[STRANGER] Stopping polling");
          clearInterval(intervalRef.current);
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [status, userId, tryMatch]);

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (userId) {
        console.log("[STRANGER] Cleanup: leaving queue for user:", userId);
        leaveStrangerQueue(userId);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  const reset = useCallback(async () => {
    console.log("[STRANGER] Resetting matchmaking state");
    setStatus("idle");
    setMatchResult({ partnerId: null, conversationId: null });
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (userId) {
      await leaveStrangerQueue(userId);
    }
  }, [userId]);

  return { status, matchResult, joinQueue, reset };
}
