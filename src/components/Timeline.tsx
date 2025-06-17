
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, MapPin, Smile, Send, Heart, MessageCircle, Share, MoreHorizontal, Trash2 } from "lucide-react";
import { useTimelinePosts } from "@/hooks/useTimelinePosts";
import { useTimelineComments } from "@/hooks/useTimelineComments";
import { usePostLikes } from "@/hooks/usePostLikes";
import { useToast } from "@/components/ui/use-toast";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RealTimeActivityPanel from "./RealTimeActivityPanel";
import TimelineChatList from "./TimelineChatList";

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
  const { posts, isLoading, createPost, creating, deletePost, deleting } = useTimelinePosts(user?.id);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaURL, setMediaURL] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [location, setLocation] = useState<{ name: string } | null>(null);
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!content.trim() && !mediaURL) {
      toast({
        title: "Vui lòng nhập nội dung hoặc chọn ảnh/video.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPost({
        content: content.trim(),
        user_id: user?.id as string,
        media_url: mediaURL || undefined,
        media_type: mediaType || undefined,
        location: location || undefined,
      });
      setContent("");
      setMedia(null);
      setMediaURL(null);
      setMediaType(null);
      setLocation(null);
      toast({
        title: "Đăng bài thành công!",
      });
    } catch (error: any) {
      toast({
        title: "Đăng bài thất bại...",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file (ví dụ: giới hạn 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file quá lớn. Vui lòng chọn file dưới 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra loại file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Loại file không hợp lệ. Vui lòng chọn ảnh (JPEG, PNG, GIF) hoặc video (MP4, MOV).",
        variant: "destructive",
      });
      return;
    }

    setMedia(file);

    try {
      const result = await uploadTimelineMedia(file);
      if (typeof result === 'string') {
        setMediaURL(result);
        setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
      } else {
        setMediaURL(result.publicURL);
        setMediaType(result.type);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi tải lên media",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLocationSelect = () => {
    // TODO: Mở map, chọn location -> setLocation
    setLocation({ name: "Hà Nội" });
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaURL(null);
    setMediaType(null);
  };

  return (
    <div className="flex max-w-7xl mx-auto gap-4">
      {/* Real-time Activity Panel - Left Side */}
      <RealTimeActivityPanel userId={user?.id} />

      {/* Main Timeline Content */}
      <main className="flex-1 max-w-2xl mx-auto p-4 space-y-6">
        {/* Post Creation Form */}
        <Card className="bg-white shadow-sm">
          <div className="flex items-center space-x-2 p-4">
            <img
              src={user?.avatar || "/placeholder.svg"}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <Textarea
              placeholder="Hôm nay bạn thế nào? Chia sẻ link website..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none border-none focus-visible:ring-0 shadow-none"
            />
          </div>
          {mediaURL && (
            <div className="relative">
              {mediaType === "image" ? (
                <img src={mediaURL} alt="Uploaded" className="w-full object-cover max-h-96" />
              ) : (
                <video src={mediaURL} controls className="w-full object-cover max-h-96" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 rounded-full"
                onClick={clearMedia}
              >
                <Trash2 className="h-4 w-4 text-white" />
              </Button>
            </div>
          )}
          <div className="flex justify-between items-center p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="media-upload"
                className="hidden"
                onChange={handleMediaUpload}
                accept="image/*, video/*"
              />
              <Button variant="ghost" size="icon" asChild>
                <label htmlFor="media-upload">
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                </label>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLocationSelect}>
                <MapPin className="h-5 w-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
            <Button onClick={handleCreatePost} disabled={creating}>
              {creating ? "Đang đăng..." : "Đăng"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Posts Rendering */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => (
              <Card key={post.id} className="bg-white shadow-sm">
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.profiles?.avatar || "/placeholder.svg"}
                      alt={post.profiles?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{post.profiles?.name}</div>
                      <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
                          deletePost(post.id);
                        }
                      }} disabled={deleting}>
                        {deleting ? "Đang xóa..." : "Xóa"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {post.media_url && (
                  <div className="relative">
                    {post.media_type === "image" ? (
                      <img src={post.media_url} alt="Post media" className="w-full object-cover max-h-96" />
                    ) : (
                      <video src={post.media_url} controls className="w-full object-cover max-h-96" />
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="whitespace-pre-wrap break-words">
                    {renderTextWithLinks(post.content)}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border-t">
                  <div className="flex items-center space-x-4">
                    <PostActions postId={post.id} userId={user?.id} />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
                <Collapsible className="w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="justify-start rounded-none p-4 w-full focus-visible:ring-0 focus-visible:ring-offset-0">
                      Xem bình luận
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    <Comments postId={post.id} userId={user?.id} />
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Timeline Chat List - Right Side */}
      <TimelineChatList currentUserId={user?.id || ""} />
    </div>
  );
}

function PostActions({ postId, userId }: { postId: string; userId?: string }) {
  const { liked, likeCount, like, unlike, isToggling } = usePostLikes(postId, userId);

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (liked) {
            unlike();
          } else {
            like();
          }
        }}
        disabled={isToggling}
      >
        <Heart className={`w-4 h-4 mr-2 ${liked ? "text-red-500" : "text-gray-500"}`} />
        {likeCount} Thích
      </Button>
      <Button variant="ghost" size="sm">
        <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
        Bình luận
      </Button>
    </div>
  );
}

function Comments({ postId, userId }: { postId: string; userId?: string }) {
  const { comments, isLoading, createComment, creating } = useTimelineComments(postId);
  const [commentText, setCommentText] = useState("");

  const handleCreateComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({
        content: commentText.trim(),
        user_id: userId as string,
        post_id: postId,
      });
      setCommentText("");
    } catch (error: any) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {comments?.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-2">
              <img
                src={comment.profiles?.avatar || "/placeholder.svg"}
                alt={comment.profiles?.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold">{comment.profiles?.name}</div>
                <div className="text-sm text-gray-500 whitespace-pre-wrap break-words">
                  {renderTextWithLinks(comment.content)}
                </div>
                <div className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Textarea
          placeholder="Thêm bình luận... (có thể chứa link)"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="resize-none border-none focus-visible:ring-0 shadow-none"
        />
        <Button onClick={handleCreateComment} disabled={creating} size="sm">
          {creating ? "Đang gửi..." : "Gửi"}
        </Button>
      </div>
    </div>
  );
}
