
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
  const isPollingRef = useRef(false);

  const startQueue = async (userId: string) => {
    console.log("🚀 [MATCHMAKING] Starting queue for userId:", userId);

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
        console.log("✅ [MATCHMAKING] Found existing recent match:", existingMatch);
        setPartnerId(existingMatch.partnerId);
        setConversationId(existingMatch.conversationId);
        setIsMatched(true);
        setIsInQueue(false);
        return;
      }

      // Join queue
      await joinStrangerQueue(userId);
      console.log("📝 [MATCHMAKING] Successfully joined queue");
      setIsInQueue(true);
      setIsMatched(false);

      // Start aggressive polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      
      isPollingRef.current = true;
      console.log("🔄 [MATCHMAKING] Starting aggressive polling...");

      const pollForMatch = async () => {
        if (!isPollingRef.current || !userIdRef.current) {
          console.log("❌ [MATCHMAKING] Polling stopped - no user or polling disabled");
          return;
        }

        const currentUserId = userIdRef.current;
        console.log("🔍 [MATCHMAKING] Polling round for user:", currentUserId);
        
        try {
          // ALWAYS check backend first - this is critical for second user
          console.log("🔍 [MATCHMAKING] Checking backend for existing match...");
          const backendMatch = await checkForExistingMatch(currentUserId);
          
          if (backendMatch && backendMatch.partnerId && backendMatch.conversationId) {
            console.log("🎯 [MATCHMAKING] ✅ BACKEND MATCH FOUND!", {
              partnerId: backendMatch.partnerId,
              conversationId: backendMatch.conversationId,
              currentUser: currentUserId
            });
            
            // Stop polling immediately
            isPollingRef.current = false;
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            
            // Update state immediately and forcefully
            console.log("🎯 [MATCHMAKING] Updating state NOW...");
            setPartnerId(backendMatch.partnerId);
            setConversationId(backendMatch.conversationId);
            setIsMatched(true);
            setIsInQueue(false);
            
            // Leave queue
            await leaveStrangerQueue(currentUserId);
            console.log("🎯 [MATCHMAKING] ✅ MATCH COMPLETE - UI should update now!");
            return;
          }

          // If no existing match, try to create new match
          console.log("🔍 [MATCHMAKING] No backend match, looking for new partner...");
          const partner = await findMatch(currentUserId);
          
          if (partner) {
            console.log("👥 [MATCHMAKING] Found potential partner:", partner);
            
            // Stop polling to prevent race conditions
            isPollingRef.current = false;
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            
            const result = await createConversation(currentUserId, partner);
            if (result && result.conversationId) {
              console.log("🎉 [MATCHMAKING] ✅ NEW CONVERSATION CREATED!", {
                conversationId: result.conversationId,
                partner: partner,
                currentUser: currentUserId
              });
              
              // Update state
              setPartnerId(partner);
              setConversationId(result.conversationId);
              setIsMatched(true);
              setIsInQueue(false);
              
              // Leave queue
              await leaveStrangerQueue(currentUserId);
              console.log("🎉 [MATCHMAKING] ✅ NEW MATCH COMPLETE!");
              return;
            } else {
              console.log("❌ [MATCHMAKING] Failed to create conversation, resuming polling...");
              isPollingRef.current = true;
            }
          }
          
          console.log("⏳ [MATCHMAKING] No match this round, continuing...");
          
        } catch (error) {
          console.error("❌ [MATCHMAKING] Polling error:", error);
        }
      };

      // Start immediate polling
      pollForMatch();
      
      pollingRef.current = window.setInterval(pollForMatch, 1500); // More frequent polling

    } catch (err) {
      console.error("❌ [MATCHMAKING] Error starting queue:", err);
      setError(err instanceof Error ? err.message : "Failed to join queue");
    }
  };

  const stopQueue = async () => {
    console.log("🛑 [MATCHMAKING] Stopping queue");

    isPollingRef.current = false;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
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
    console.log("🔄 [MATCHMAKING] Resetting state");

    isPollingRef.current = false;
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
      isPollingRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (userIdRef.current) {
        leaveStrangerQueue(userIdRef.current);
      }
    };
  }, []);

  // Enhanced debug logging
  useEffect(() => {
    console.log("📊 [MATCHMAKING STATE]", {
      isInQueue,
      isMatched,
      partnerId,
      conversationId,
      error,
      isPolling: isPollingRef.current,
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
