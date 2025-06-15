
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
    console.log("[STRANGER] [startQueue] Starting for userId =", userId, "Type:", typeof userId);

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
        console.log("[STRANGER] [startQueue] Early exit: Found recent match");
        return;
      }

      // Join queue
      await joinStrangerQueue(userId);
      console.log("[STRANGER] [startQueue] Successfully joined queue");
      setIsInQueue(true);
      setIsMatched(false);

      // Start polling for matches
      console.log("[STRANGER] Starting polling for matches");
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      pollingRef.current = window.setInterval(async () => {
        const currentUserId = userIdRef.current;
        if (!currentUserId) {
          console.log("[STRANGER][POLL] No userId, stopping polling");
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }

        console.log("[STRANGER][POLL] Checking for match for user:", currentUserId);
        
        // ALWAYS check backend first - this is crucial for the second user
        const backendMatch = await checkForExistingMatch(currentUserId);
        if (backendMatch && backendMatch.partnerId && backendMatch.conversationId) {
          console.log("[STRANGER][POLL] ✅ FOUND MATCH IN BACKEND:", backendMatch);
          
          // Force update all states immediately
          setPartnerId(backendMatch.partnerId);
          setConversationId(backendMatch.conversationId);
          setIsMatched(true);
          setIsInQueue(false);
          
          // Leave queue and stop polling
          await leaveStrangerQueue(currentUserId);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          
          console.log("[STRANGER][POLL] ✅ STATE UPDATED - User should see chat now");
          return;
        }

        // If no existing match, try to create new match
        console.log("[STRANGER][POLL] No backend match found, trying to find new partner");
        const partner = await findMatch(currentUserId);
        if (partner) {
          console.log("[STRANGER][POLL] Found potential partner:", partner);
          const result = await createConversation(currentUserId, partner);
          if (result && result.conversationId) {
            console.log("[STRANGER][POLL] ✅ CREATED NEW CONVERSATION:", result);
            
            // Update states
            setPartnerId(partner);
            setConversationId(result.conversationId);
            setIsMatched(true);
            setIsInQueue(false);
            
            // Leave queue and stop polling
            await leaveStrangerQueue(currentUserId);
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            
            console.log("[STRANGER][POLL] ✅ NEW MATCH CREATED - User should see chat now");
            return;
          }
        }
        
        console.log("[STRANGER][POLL] No match found this round, continuing...");
      }, 2000); // Check every 2 seconds

    } catch (err) {
      console.error("[STRANGER] [startQueue] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to join queue");
    }
  };

  const stopQueue = async () => {
    console.log("[STRANGER] [stopQueue] Stopping queue");

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log("[STRANGER] Stopped polling");
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

  // Debug logging for state changes
  useEffect(() => {
    console.log("[STRANGER][STATE] State changed:", {
      isInQueue,
      isMatched,
      partnerId,
      conversationId,
      error,
      timestamp: new Date().toISOString()
    });
  }, [isInQueue, isMatched, partnerId, conversationId, error]);

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
