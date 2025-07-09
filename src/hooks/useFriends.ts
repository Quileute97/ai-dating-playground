
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFriends(userId: string | null | undefined, status: 'accepted' | 'pending' = 'accepted', limit: number = 5) {
  return useQuery({
    queryKey: ["friends", userId, status, limit],
    queryFn: async () => {
      if (!userId) return [];
      
      // Fixed: Remove the foreign key relationship that was causing 400 error
      const { data, error } = await supabase
        .from("friends")
        .select(`
          id,
          user_id,
          friend_id,
          created_at,
          status
        `)
        .eq("status", status)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Friends query error:', error);
        return [];
      }
      
      // Get profile information separately to avoid foreign key issues
      if (data && data.length > 0) {
        const friendIds = data.map(friend => 
          friend.user_id === userId ? friend.friend_id : friend.user_id
        );
        
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar")
          .in("id", friendIds);
        
        // Combine the data
        return data.map(friend => {
          const friendId = friend.user_id === userId ? friend.friend_id : friend.user_id;
          const profile = profiles?.find(p => p.id === friendId);
          return {
            ...friend,
            profile: profile || { name: 'Unknown', avatar: null }
          };
        });
      }
      
      return data || [];
    },
    staleTime: 30 * 1000,
    enabled: !!userId
  });
}

export function useActiveFriends(userId: string | null | undefined) {
  return useFriends(userId, 'accepted', 5);
}

export function usePendingFriendRequests(userId: string | null | undefined) {
  return useFriends(userId, 'pending', 10);
}

// Add the missing functions that other components depend on
export function useFriendList(userId: string | null | undefined) {
  return useFriends(userId, 'accepted', 100); // Get all friends
}

export function useReceivedFriendRequests(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["received-friend-requests", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("friend_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('Received friend requests query error:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 30 * 1000,
    enabled: !!userId
  });
}

export function useSentFriendRequests(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["sent-friend-requests", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('Sent friend requests query error:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 30 * 1000,
    enabled: !!userId
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ user_id, friend_id }: { user_id: string; friend_id: string }) => {
      const { data, error } = await supabase
        .from("friends")
        .insert({
          user_id,
          friend_id,
          status: "pending"
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["sent-friend-requests"] });
    }
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from("friends")
        .update({ 
          status: "accepted",
          accepted_at: new Date().toISOString()
        })
        .eq("id", requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["received-friend-requests"] });
    }
  });
}

export function useDeleteFriend() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["received-friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["sent-friend-requests"] });
    }
  });
}
