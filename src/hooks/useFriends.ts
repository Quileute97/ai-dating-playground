
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

// Lấy danh sách tất cả bạn bè (status = accepted)
export function useFriendList(myId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["friends", myId],
    enabled: !!myId,
    queryFn: async () => {
      if (!myId) return [];
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${myId},friend_id.eq.${myId}`)
        .eq("status", "accepted");
      if (error) throw error;
      return data as Friend[];
    }
  });

  // Realtime subscription cho friends
  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel('friends-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friends'
      }, (payload) => {
        console.log('👥 Friends realtime update:', payload);
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["sent-friend-requests"] });
        queryClient.invalidateQueries({ queryKey: ["received-friend-requests"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, queryClient]);

  return query;
}

// Danh sách lời mời gửi đi ("pending" và mình là user_id)
export function useSentFriendRequests(myId: string | undefined) {
  return useQuery({
    queryKey: ["sent-friend-requests", myId],
    enabled: !!myId,
    queryFn: async () => {
      if (!myId) return [];
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", myId)
        .eq("status", "pending");
      if (error) throw error;
      return data as Friend[];
    }
  });
}

// Danh sách lời mời nhận được ("pending" và mình là friend_id)
export function useReceivedFriendRequests(myId: string | undefined) {
  return useQuery({
    queryKey: ["received-friend-requests", myId],
    enabled: !!myId,
    queryFn: async () => {
      if (!myId) return [];
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("friend_id", myId)
        .eq("status", "pending");
      if (error) throw error;
      return data as Friend[];
    }
  });
}

// Gửi lời mời kết bạn
export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user_id,
      friend_id,
    }: { user_id: string; friend_id: string }) => {
      const { data, error } = await supabase
        .from("friends")
        .insert([{ user_id, friend_id }])
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sent-friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["received-friend-requests"] });
    },
  });
}

// Chấp nhận lời mời
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// Từ chối/xoá lời mời hoặc huỷ kết bạn
export function useDeleteFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("friends").delete().eq("id", id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
