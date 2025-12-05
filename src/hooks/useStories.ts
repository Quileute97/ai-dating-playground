import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  user_name?: string;
  user_avatar?: string;
}

export interface GroupedStories {
  user_id: string;
  user_name: string;
  user_avatar: string;
  stories: Story[];
}

export function useStories(userId?: string) {
  const queryClient = useQueryClient();

  // Fetch all active stories grouped by user
  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for stories
      if (!data || data.length === 0) return [];

      const userIds = [...new Set(data.map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return data.map((story) => ({
        ...story,
        user_name: profileMap.get(story.user_id)?.name || "Ẩn danh",
        user_avatar: profileMap.get(story.user_id)?.avatar,
      }));
    },
  });

  // Group stories by user
  const groupedStories: GroupedStories[] = stories
    ? Object.values(
        stories.reduce((acc: Record<string, GroupedStories>, story: Story) => {
          if (!acc[story.user_id]) {
            acc[story.user_id] = {
              user_id: story.user_id,
              user_name: story.user_name || "Ẩn danh",
              user_avatar: story.user_avatar || "",
              stories: [],
            };
          }
          acc[story.user_id].stories.push(story);
          return acc;
        }, {})
      )
    : [];

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (data: { media_url: string; media_type: string }) => {
      const { data: result, error } = await supabase
        .from("stories")
        .insert([{ ...data, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("stories-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stories" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["stories"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Check if current user has active story
  const hasMyStory = stories?.some((s) => s.user_id === userId) || false;

  return {
    stories,
    groupedStories,
    isLoading,
    hasMyStory,
    createStory: createStoryMutation.mutateAsync,
    isCreating: createStoryMutation.isPending,
  };
}
