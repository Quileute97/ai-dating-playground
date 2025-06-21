
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, User, Calendar, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostLikes } from "@/hooks/usePostLikes";
import { useTimelineComments } from "@/hooks/useTimelineComments";

interface PostDetailModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface LocationData {
  name?: string;
  [key: string]: any;
}

export default function PostDetailModal({ postId, isOpen, onClose, userId }: PostDetailModalProps) {
  const [commentInput, setCommentInput] = useState("");
  
  const { data: post, isLoading } = useQuery({
    queryKey: ["post-detail", postId],
    enabled: !!postId && isOpen,
    queryFn: async () => {
      if (!postId) return null;
      
      // Fetch post with profile data
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles: user_id (id, name, avatar)
        `)
        .eq("id", postId)
        .single();
        
      if (postError) throw postError;
      return postData;
    }
  });

  // Sử dụng hooks để xử lý likes và comments
  const { likeCount, liked, like, unlike, isToggling } = usePostLikes(postId || undefined, userId);
  const { comments, createComment, creating } = useTimelineComments(postId || undefined);

  const handleLike = async () => {
    if (!userId) return;
    if (liked) await unlike();
    else await like();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !userId || !postId) return;
    
    await createComment({
      post_id: postId,
      user_id: userId,
      content: commentInput,
    });
    setCommentInput("");
  };

  if (!isOpen) return null;

  const locationData = post?.location as LocationData | null;

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
            {locationData?.name && (
              <div className="text-sm text-gray-600">
                📍 {locationData.name}
              </div>
            )}

            {/* Actions - Chỉ hiển thị khi có userId */}
            {userId && (
              <div className="flex items-center gap-4 pt-2 border-t">
                <Button
                  size="sm"
                  variant={liked ? "secondary" : "outline"}
                  className={`transition-all rounded-full px-3 py-1.5 h-8 ${
                    liked ? "text-pink-500 border-pink-400" : "border-gray-200"
                  }`}
                  onClick={handleLike}
                  disabled={isToggling}
                >
                  <Heart className={liked ? "fill-pink-500 text-pink-500" : ""} size={16} />
                  <span className="ml-1 text-sm">{likeCount > 0 ? likeCount : ""}</span>
                </Button>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments?.length || 0} bình luận</span>
                </div>
              </div>
            )}

            {/* Comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                {comments.map((cmt: any) => (
                  <div key={cmt.id} className="flex items-start gap-2">
                    <img 
                      src={cmt.profiles?.avatar || "/placeholder.svg"} 
                      alt={cmt.profiles?.name || "User"} 
                      className="w-6 h-6 rounded-full object-cover border flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 leading-none mb-1">
                        <span className="font-semibold text-sm">{cmt.profiles?.name ?? "Ẩn danh"}</span>
                        <span className="text-xs text-gray-400">{new Date(cmt.created_at).toLocaleTimeString("vi-VN")}</span>
                      </div>
                      <div className="text-sm text-gray-800">{cmt.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input - Chỉ hiển thị khi có userId */}
            {userId && (
              <form className="flex items-center gap-2 mt-2" onSubmit={handleCommentSubmit}>
                <Input
                  className="h-8 text-sm bg-gray-50 border border-gray-200 flex-1"
                  value={commentInput}
                  placeholder="Viết bình luận..."
                  onChange={e => setCommentInput(e.target.value)}
                  disabled={creating}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="secondary" 
                  className="aspect-square h-8 w-8 p-0 flex-shrink-0" 
                  disabled={creating || !commentInput.trim()}
                >
                  <SendHorizonal size={14} />
                </Button>
              </form>
            )}

            {/* Message khi chưa đăng nhập */}
            {!userId && (
              <div className="text-center text-gray-500 py-4 border-t">
                Vui lòng đăng nhập để tương tác với bài viết
              </div>
            )}
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
