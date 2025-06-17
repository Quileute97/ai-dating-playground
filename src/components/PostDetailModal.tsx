
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, User, Calendar } from "lucide-react";

interface PostDetailModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostDetailModal({ postId, isOpen, onClose }: PostDetailModalProps) {
  const { data: post, isLoading } = useQuery({
    queryKey: ["post-detail", postId],
    enabled: !!postId && isOpen,
    queryFn: async () => {
      if (!postId) return null;
      
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles: user_id (id, name, avatar)
        `)
        .eq("id", postId)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bài viết</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : post ? (
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <img
                src={post.profiles?.avatar || "/placeholder.svg"}
                alt={post.profiles?.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{post.profiles?.name || "Người dùng"}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleString("vi-VN")}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-gray-800">{post.content}</div>

            {/* Media */}
            {post.media_url && (
              <div className="rounded-lg overflow-hidden">
                {post.media_type === "image" ? (
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="w-full max-h-96 object-cover"
                  />
                ) : post.media_type === "video" ? (
                  <video
                    src={post.media_url}
                    controls
                    className="w-full max-h-96"
                  />
                ) : null}
              </div>
            )}

            {/* Location */}
            {post.location && (
              <div className="text-sm text-gray-600">
                📍 {post.location.name || "Vị trí"}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Heart className="w-4 h-4" />
                <span>{post.likes_count || 0} lượt thích</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments_count || 0} bình luận</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Không tìm thấy bài viết
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
