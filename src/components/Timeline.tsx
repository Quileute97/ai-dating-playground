import React, { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTimelinePosts } from "@/hooks/useTimelinePosts";
import { useTimelineComments } from "@/hooks/useTimelineComments";
import { usePostLikes } from "@/hooks/usePostLikes";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";
import TimelineChatList from "./TimelineChatList";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Upload,
  X,
  MapPin,
  Clock,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TimelineProps {
  user?: any;
}

// Utility function to detect and render links
const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function Timeline({ user }: TimelineProps) {
  console.log('🎯 Timeline component rendered with user:', user);

  const { posts, isLoading, createPost, creating, deletePost, deleting } = useTimelinePosts(user?.id);
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('📊 Timeline posts data:', { posts, isLoading });

  const handleCreatePost = async () => {
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để đăng bài");
      return;
    }

    if (!postContent.trim() && !selectedFile) {
      toast.error("Vui lòng nhập nội dung hoặc chọn file");
      return;
    }

    setIsUploading(true);
    try {
      let mediaUrl = "";
      let mediaType = "";

      if (selectedFile) {
        console.log("Uploading file:", selectedFile.name);
        mediaUrl = await uploadTimelineMedia(selectedFile);
        mediaType = selectedFile.type.startsWith("image/") ? "image" : "video";
        console.log("File uploaded successfully:", mediaUrl);
      }

      await createPost({
        content: postContent.trim() || "",
        user_id: user.id,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
      });

      setPostContent("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Đăng bài thành công!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("Có lỗi khi đăng bài: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để bình luận");
      return;
    }

    const content = commentTexts[postId]?.trim();
    if (!content) return;

    try {
      const { createComment } = useTimelineComments(postId);
      await createComment({
        content,
        user_id: user.id,
        post_id: postId,
      });
      
      setCommentTexts(prev => ({ ...prev, [postId]: "" }));
      toast.success("Đã thêm bình luận!");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Có lỗi khi thêm bình luận");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để xóa bài viết");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        await deletePost(postId);
        toast.success("Đã xóa bài viết!");
      } catch (error: any) {
        console.error("Error deleting post:", error);
        toast.error(error.message || "Có lỗi khi xóa bài viết");
      }
    }
  };

  const openPostDetail = (post: any) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Main Timeline Content */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Post Creation Form */}
        <div className="bg-white border-b border-purple-100 p-4 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <img
                src={user?.avatar || "/placeholder.svg"}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 space-y-3">
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder={user ? "Bạn đang nghĩ gì?" : "Đăng nhập để chia sẻ suy nghĩ..."}
                  className="resize-none border-gray-200 focus:border-purple-300"
                  rows={3}
                  disabled={!user || isUploading}
                />

                {selectedFile && (
                  <div className="relative inline-block">
                    <div className="bg-gray-100 p-2 rounded-lg flex items-center gap-2">
                      <span className="text-sm text-gray-600">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeSelectedFile}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={!user || isUploading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!user || isUploading}
                      className="hover:bg-purple-50"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      File
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!user || (!postContent.trim() && !selectedFile) || creating || isUploading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {creating || isUploading ? "Đang đăng..." : "Đăng bài"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Posts */}
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải bài viết...</div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  expandedComments={expandedComments}
                  commentTexts={commentTexts}
                  setCommentTexts={setCommentTexts}
                  toggleComments={toggleComments}
                  handleCommentSubmit={handleCommentSubmit}
                  handleDeletePost={handleDeletePost}
                  openPostDetail={openPostDetail}
                  formatTimeAgo={formatTimeAgo}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">🌟</div>
                <p className="text-gray-500">Chưa có bài viết nào</p>
                <p className="text-sm text-gray-400">Hãy là người đầu tiên chia sẻ!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Timeline Chat Sidebar */}
      {user && <TimelineChatList currentUserId={user.id} />}

      {/* Post Detail Modal */}
      <Dialog open={showPostDetail} onOpenChange={setShowPostDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <PostCard
              post={selectedPost}
              user={user}
              expandedComments={new Set([selectedPost.id])}
              commentTexts={commentTexts}
              setCommentTexts={setCommentTexts}
              toggleComments={() => {}}
              handleCommentSubmit={handleCommentSubmit}
              handleDeletePost={handleDeletePost}
              openPostDetail={() => {}}
              formatTimeAgo={formatTimeAgo}
              isDetailView={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// PostCard component to avoid repetition
function PostCard({
  post,
  user,
  expandedComments,
  commentTexts,
  setCommentTexts,
  toggleComments,
  handleCommentSubmit,
  handleDeletePost,
  openPostDetail,
  formatTimeAgo,
  isDetailView = false
}: any) {
  const { comments } = useTimelineComments(post.id);
  const { isLiked, likeCount, toggleLike } = usePostLikes(post.id, user?.id);

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer bg-white border-purple-100"
      onClick={() => !isDetailView && openPostDetail(post)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <img
              src={post.profiles?.avatar || "/placeholder.svg"}
              alt={post.profiles?.name || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium text-gray-900">
                {post.profiles?.name || "Người dùng"}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>Có vị trí</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {user?.id === post.user_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePost(post.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {post.content && (
          <p className="mb-3 text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {post.media_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            {post.media_type === "image" ? (
              <img
                src={post.media_url}
                alt="Post media"
                className="w-full max-h-96 object-cover"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={post.media_url}
                controls
                className="w-full max-h-96"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
              className={`hover:bg-red-50 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleComments(post.id);
              }}
              className="hover:bg-blue-50 text-gray-500"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {comments?.length || 0}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-green-50 text-gray-500"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {(expandedComments.has(post.id) || isDetailView) && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3" onClick={(e) => e.stopPropagation()}>
            {comments && comments.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2">
                    <img
                      src={comment.profiles?.avatar || "/placeholder.svg"}
                      alt={comment.profiles?.name || "User"}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 bg-gray-50 rounded-lg p-2">
                      <div className="font-medium text-sm text-gray-900">
                        {comment.profiles?.name || "Người dùng"}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {comment.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(comment.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {user && (
              <div className="flex gap-2">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt="Your avatar"
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <Input
                    value={commentTexts[post.id] || ""}
                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Viết bình luận..."
                    className="flex-1 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit(post.id);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCommentSubmit(post.id)}
                    disabled={!commentTexts[post.id]?.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
