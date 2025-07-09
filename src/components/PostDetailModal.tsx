
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, User, Calendar, SendHorizonal, AlertCircle } from "lucide-react";
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
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post-detail", postId],
    enabled: !!postId && isOpen,
    queryFn: async () => {
      if (!postId) return null;
      
      try {
        // Fetch post with profile data
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(`
            *,
            profiles: user_id (id, name, avatar)
          `)
          .eq("id", postId)
          .single();
          
        if (postError) {
          console.error("Error fetching post:", postError);
          throw postError;
        }
        return postData;
      } catch (err) {
        console.error("Query error:", err);
        throw err;
      }
    }
  });

  // Use hooks to handle likes and comments
  const { likeCount, liked, like, unlike, isToggling } = usePostLikes(postId || undefined, userId);
  const { comments, createComment, creating } = useTimelineComments(postId || undefined);

  const handleLike = async () => {
    if (!userId) return;
    try {
      if (liked) await unlike();
      else await like();
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !userId || !postId) return;
    
    try {
      await createComment({
        post_id: postId,
        user_id: userId,
        content: commentInput,
      });
      setCommentInput("");
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Show error state
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Lỗi tải bài viết
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-gray-600 mb-4">Không thể tải bài viết. Vui lòng thử lại.</p>
            <Button onClick={onClose} variant="outline">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const locationData = post?.location as LocationData | null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bài viết</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
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
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
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
            {post.content && (
              <div className="text-gray-800 whitespace-pre-line">{post.content}</div>
            )}

            {/* Media */}
            {post.media_url && (
              <div className="rounded-lg overflow-hidden">
                {post.media_type === "image" ? (
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="w-full max-h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : post.media_type === "video" ? (
                  <video
                    src={post.media_url}
                    controls
                    className="w-full max-h-96"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
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

            {/* Actions - Only show when there's userId */}
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
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
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

            {/* Comment Input - Only show when there's userId */}
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

            {/* Message when not logged in */}
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
