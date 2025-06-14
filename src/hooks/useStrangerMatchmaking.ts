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
        return;
      }

      // Join queue
      await joinStrangerQueue(userId);
      console.log("[STRANGER] [startQueue] Successfully joined queue");
      setIsInQueue(true);

      // Start polling for matches with shorter interval for better responsiveness
      console.log("[STRANGER] Starting polling for matches");
      pollingRef.current = window.setInterval(async () => {
        await tryMatch(userId);
      }, 1500); // Check every 1.5 seconds

    } catch (err) {
      console.error("[STRANGER] [startQueue] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to join queue");
    }
  };

  const tryMatch = async (userId: string) => {
    try {
      console.log("[STRANGER] [tryMatch] Attempting to find match for:", userId);
      
      // First check if someone already created a conversation with us
      const existingMatch = await checkForExistingMatch(userId);
      if (existingMatch) {
        console.log("[STRANGER] [tryMatch] Found existing match:", existingMatch);
        setPartnerId(existingMatch.partnerId);
        setConversationId(existingMatch.conversationId);
        setIsMatched(true);
        setIsInQueue(false);
        
        // Remove from queue and stop polling
        await leaveStrangerQueue(userId);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        console.log("[STRANGER] Stopping polling - found existing match");
        return;
      }

      // Look for a partner in queue
      const partner = await findMatch(userId);
      if (partner) {
        console.log("[STRANGER] [tryMatch] Found partner in queue:", partner);
        
        // Create conversation
        const result = await createConversation(userId, partner);
        if (result) {
          console.log("[STRANGER] [tryMatch] Conversation created:", result);
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
          console.log("[STRANGER] Stopping polling - match created");
        }
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
