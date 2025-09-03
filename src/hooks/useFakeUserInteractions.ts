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
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('user_likes')
        .select('id')
        .eq('liker_id', currentUserId)
        .eq('liked_id', fakeUserId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('liker_id', currentUserId)
          .eq('liked_id', fakeUserId);
        
        if (error) throw error;
        return { matched: false };
      } else {
        // Like
        const { error } = await supabase
          .from('user_likes')
          .insert({
            liker_id: currentUserId,
            liked_id: fakeUserId,
            liker_type: 'real',
            liked_type: 'fake'
          });
        
        if (error) throw error;
        
        // Check for mutual like
        const { data: mutualLike } = await supabase
          .from('user_likes')
          .select('id')
          .eq('liker_id', fakeUserId)
          .eq('liked_id', currentUserId)
          .single();
        
        return { matched: !!mutualLike };
      }
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
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUserId
          });
        
        if (error) throw error;
      }
      
      return true;
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
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: content
        })
        .select()
        .single();
      
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
      
      // Check if already friends
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${fakeUserId}),and(user_id.eq.${fakeUserId},friend_id.eq.${currentUserId})`)
        .single();

      if (existingFriend) {
        throw new Error("Already friends");
      }

      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: currentUserId,
          friend_id: fakeUserId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["sent-friend-requests"] });
      toast({
        title: "Đã kết bạn",
        description: "Đã kết bạn thành công",
      });
    }
  });

  // Create conversation with fake user
  const createConversationWithFakeUser = useMutation({
    mutationFn: async (fakeUserId: string) => {
      if (!currentUserId) throw new Error("User not logged in");
      
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_real_id.eq.${currentUserId},user_fake_id.eq.${fakeUserId}),and(user_fake_id.eq.${fakeUserId},user_real_id.eq.${currentUserId})`)
        .single();

      if (existingConversation) {
        return existingConversation;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_real_id: currentUserId,
          user_fake_id: fakeUserId
        })
        .select()
        .single();
      
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