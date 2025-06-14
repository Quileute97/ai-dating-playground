
import { supabase } from "@/integrations/supabase/client";
import { isUUIDv4 } from "@/utils/uuidUtils";

/**
 * Removes all non-UUID users from the queue to clear out anonymous/fake entries.
 */
const removeAllAnonymousFromQueue = async () => {
  const { data: queueList } = await supabase.from("stranger_queue").select("user_id");
  if (!queueList) return;

  const anonIds = queueList
    .filter((item) => !isUUIDv4(item.user_id))
    .map((item) => item.user_id);

  if (anonIds.length > 0) {
    console.log("[StrangerService] Removing anonymous users from queue:", anonIds);
    await supabase.from("stranger_queue").delete().in("user_id", anonIds);
  }
};

/**
 * Adds a user to the stranger queue if they are not already in it.
 * @param userId The user's ID.
 */
export const joinStrangerQueue = async (userId: string) => {
  console.log("[StrangerService] Joining queue with userId:", userId, "Type:", typeof userId, "Is UUID:", isUUIDv4(userId));
  
  if (!userId) {
    console.error("[StrangerService] No user ID provided");
    throw new Error("No user ID provided");
  }

  // Don't filter by UUID for anonymous users - let them join the queue
  await removeAllAnonymousFromQueue();

  const { data: existing } = await supabase
    .from("stranger_queue")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  console.log("[StrangerService] Existing queue entry:", existing);

  if (!existing) {
    const { data: inserted, error } = await supabase
      .from("stranger_queue")
      .insert([{ user_id: userId }])
      .select();
    
    if (error) {
      console.error("[StrangerService] Error joining queue:", error);
      throw error;
    }
    console.log("[StrangerService] Successfully joined queue:", inserted);
  } else {
    console.log("[StrangerService] User already in queue.");
  }
};

/**
 * Removes a user from the stranger queue.
 * @param userId The user's ID.
 */
export const leaveStrangerQueue = async (userId: string) => {
  if (!userId) return;
  const { error } = await supabase.from("stranger_queue").delete().eq("user_id", userId);
  if (error) {
    console.error("[StrangerService] Error leaving queue:", error);
  } else {
    console.log(`[StrangerService] User ${userId} removed from queue.`);
  }
};

/**
 * Looks for another user in the queue to match with.
 * @param userId The current user's ID.
 * @returns The partner's ID if found, otherwise null.
 */
export const findMatch = async (userId: string) => {
  console.log("[StrangerService] Looking for match for user:", userId);
  
  await removeAllAnonymousFromQueue();

  const { data: queueList, error } = await supabase
    .from("stranger_queue")
    .select("user_id, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[StrangerService] Error fetching queue:", error);
    throw error;
  }
  
  console.log("[StrangerService] Current queue:", queueList);
  
  if (!queueList) return null;

  // Find someone else in the queue (not myself)
  const others = queueList.filter((item) => item.user_id !== userId);
  console.log("[StrangerService] Others in queue:", others);
  
  return others.length > 0 ? others[0].user_id : null;
};

/**
 * Checks if another user has already initiated a match with the current user.
 * @param userId The current user's ID.
 * @returns Match details if a recent conversation is found, otherwise null.
 */
export const checkForExistingMatch = async (userId: string) => {
  console.log("[StrangerService] Checking for existing match for user:", userId);
  
  const { data: conv, error } = await supabase
    .from('conversations')
    .select('id, user_fake_id, created_at')
    .eq('user_real_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error("[StrangerService] Error checking existing match:", error);
    return null;
  }

  console.log("[StrangerService] Recent conversations:", conv);

  if (conv && conv.length > 0) {
    const recentConv = conv[0];
    const timeSinceCreation = Date.now() - new Date(recentConv.created_at).getTime();
    console.log("[StrangerService] Time since creation:", timeSinceCreation, "ms");
    
    // If created in the last 30 seconds, assume it's our match
    if (timeSinceCreation < 30000) {
      console.log("[StrangerService] Found recent match:", recentConv);
      return { partnerId: recentConv.user_fake_id, conversationId: recentConv.id };
    }
  }
  return null;
};

/**
 * Creates a new two-way conversation between matched users.
 * @param userId The first user's ID.
 * @param partnerId The second user's ID.
 * @returns The new conversation's ID, or null if it already existed (race condition).
 */
export const createConversation = async (userId: string, partnerId: string) => {
  console.log("[StrangerService] Creating conversation between:", userId, "and", partnerId);
  
  // Check if conversation already exists
  const { data: existed } = await supabase
    .from("conversations")
    .select("id")
    .or(`and(user_real_id.eq.${userId},user_fake_id.eq.${partnerId}),and(user_real_id.eq.${partnerId},user_fake_id.eq.${userId})`)
    .limit(1);

  console.log("[StrangerService] Existing conversations:", existed);

  if (existed && existed.length > 0) {
    console.log('[StrangerService] Conversation already exists, returning existing:', existed[0]);
    return { conversationId: existed[0].id };
  }

  // Create first part of conversation
  const { data: c1, error: e1 } = await supabase
    .from("conversations")
    .insert([{ user_real_id: userId, user_fake_id: partnerId }])
    .select("id")
    .single();

  if (e1) {
    console.error('[StrangerService] Error creating first part of conversation', e1);
    throw new Error("Failed to create conversation.");
  }

  console.log("[StrangerService] Created conversation part 1:", c1);

  // Create second part of conversation
  const { data: c2, error: e2 } = await supabase
    .from("conversations")
    .insert([{ user_real_id: partnerId, user_fake_id: userId }])
    .select("id");

  if (e2) {
    console.error('[StrangerService] Error creating second part of conversation', e2);
    // Don't throw here, first part was successful
  } else {
    console.log("[StrangerService] Created conversation part 2:", c2);
  }

  return { conversationId: c1.id };
};
