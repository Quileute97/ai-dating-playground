import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFakeUserInteractions(currentUserId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Like fake user
  const likeFakeUser = useMutation({
    mutationFn: async (fakeUserId: string) => {
      if (!currentUserId) throw new Error("User not logged in");
      
      const { data, error } = await supabase.rpc('like_fake_user', {
        liker_id_param: currentUserId,
        liked_id_param: fakeUserId,
        liker_type_param: 'real',
        liked_type_param: 'fake'
      }) as { data: boolean, error: any };
      
      if (error) throw error;
      return { matched: data };
    },
    onSuccess: (result, fakeUserId) => {
      queryClient.invalidateQueries({ queryKey: ["user-likes"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
      
      if (result.matched) {
        toast({
          title: "It's a Match! 💖",
          description: "Bạn và người này đã thích nhau!",
        });
      } else {
        toast({
          title: "Đã thích!",
          description: "Bạn đã thích người này",
        });
      }
    }
  });

  // Like fake user post
  const likeFakePost = useMutation({
    mutationFn: async (postId: string) => {
      if (!currentUserId) throw new Error("User not logged in");
      
      const { data, error } = await supabase.rpc('like_fake_post', {
        post_id_param: postId,
        user_id_param: currentUserId
      }) as { data: void, error: any };
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-likes"] });
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    }
  });

  // Comment on fake user post
  const commentOnFakePost = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!currentUserId) throw new Error("User not logged in");
      
      const { data, error } = await supabase.rpc('comment_on_fake_post', {
        post_id_param: postId,
        user_id_param: currentUserId,
        content_param: content
      }) as { data: string, error: any };
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-comments"] });
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    }
  });

  // Send friend request to fake user
  const sendFriendRequestToFakeUser = useMutation({
    mutationFn: async (fakeUserId: string) => {
      if (!currentUserId) throw new Error("User not logged in");
      
      const { data, error } = await supabase.rpc('send_friend_request_to_fake_user', {
        real_user_id: currentUserId,
        fake_user_id: fakeUserId
      }) as { data: string, error: any };
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["sent-friend-requests"] });
      toast({
        title: "Đã gửi lời mời kết bạn",
        description: "Lời mời kết bạn đã được gửi thành công",
      });
    }
  });

  // Create conversation with fake user
  const createConversationWithFakeUser = useMutation({
    mutationFn: async (fakeUserId: string) => {
      if (!currentUserId) throw new Error("User not logged in");
      
      const { data, error } = await supabase.rpc('create_conversation_with_fake_user', {
        real_user_id: currentUserId,
        fake_user_id: fakeUserId
      }) as { data: string, error: any };
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  return {
    likeFakeUser: likeFakeUser.mutateAsync,
    likeFakePost: likeFakePost.mutateAsync,
    commentOnFakePost: commentOnFakePost.mutateAsync,
    sendFriendRequestToFakeUser: sendFriendRequestToFakeUser.mutateAsync,
    createConversationWithFakeUser: createConversationWithFakeUser.mutateAsync,
    isProcessing: likeFakeUser.isPending || likeFakePost.isPending || 
                  commentOnFakePost.isPending || sendFriendRequestToFakeUser.isPending ||
                  createConversationWithFakeUser.isPending
  };
}