
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
 * Adds a real user to the stranger queue if they are not already in it.
 * @param userId The user's ID.
 */
export const joinStrangerQueue = async (userId: string) => {
  if (!isUUIDv4(userId)) {
    console.error("[StrangerService] Only real users (UUIDv4) can join the queue.");
    throw new Error("Invalid user ID for queue.");
  }

  await removeAllAnonymousFromQueue();

  const { data: existing } = await supabase
    .from("stranger_queue")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("stranger_queue").insert([{ user_id: userId }]);
    if (error) {
      console.error("[StrangerService] Error joining queue:", error);
      throw error;
    }
  } else {
    console.log("[StrangerService] User already in queue.");
  }
};

/**
 * Removes a user from the stranger queue.
 * @param userId The user's ID.
 */
export const leaveStrangerQueue = async (userId: string) => {
  if (!isUUIDv4(userId)) return;
  await supabase.from("stranger_queue").delete().eq("user_id", userId);
  console.log(`[StrangerService] User ${userId} removed from queue.`);
};

/**
 * Looks for another user in the queue to match with.
 * @param userId The current user's ID.
 * @returns The partner's ID if found, otherwise null.
 */
export const findMatch = async (userId: string) => {
  await removeAllAnonymousFromQueue();

  const { data: queueList, error } = await supabase
    .from("stranger_queue")
    .select("user_id")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!queueList) return null;

  const others = queueList.filter((item) => item.user_id !== userId && isUUIDv4(item.user_id));
  return others.length > 0 ? others[0].user_id : null;
};

/**
 * Checks if another user has already initiated a match with the current user.
 * @param userId The current user's ID.
 * @returns Match details if a recent conversation is found, otherwise null.
 */
export const checkForExistingMatch = async (userId: string) => {
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, user_fake_id, created_at')
    .eq('user_real_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (conv && conv.length > 0) {
    const recentConv = conv[0];
    const timeSinceCreation = Date.now() - new Date(recentConv.created_at).getTime();
    // If created in the last 10 seconds, assume it's our match
    if (timeSinceCreation < 10000) {
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
  const { data: existed } = await supabase
    .from("conversations")
    .select("id")
    .or(`user_real_id.eq.${userId},user_fake_id.eq.${partnerId},and(user_real_id.eq.${partnerId},user_fake_id.eq.${userId})`)
    .limit(1);

  if (existed && existed.length > 0) {
    console.log('[StrangerService] Conversation already exists, another client was faster.');
    return null;
  }

  const { data: c1, error: e1 } = await supabase
    .from("conversations")
    .insert([{ user_real_id: userId, user_fake_id: partnerId }])
    .select("id")
    .single();

  if (e1 || !c1) {
    console.error('[StrangerService] Error creating first part of conversation', e1);
    throw new Error("Failed to create conversation.");
  }

  const { error: e2 } = await supabase
    .from("conversations")
    .insert([{ user_real_id: partnerId, user_fake_id: userId }]);

  if (e2) {
    console.error('[StrangerService] Error creating second part of conversation', e2);
    // Might need cleanup logic here in a real-world scenario
  }

  return { conversationId: c1.id };
};
