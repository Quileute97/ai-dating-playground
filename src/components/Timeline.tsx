import React, { useState, ChangeEvent } from "react";
import { User, MessageCircle, Heart, SendHorizonal, MapPin, Image as ImageIcon, Video as VideoIcon, Smile, MoreHorizontal, Trash2, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";
import { VN_PROVINCES } from "@/utils/vnProvinces";
import HashtagPostsModal from "./HashtagPostsModal";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useChatIntegration } from '@/hooks/useChatIntegration';
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

// -- Sticker data (Gen Z)
const STICKERS = [
  { id: 1, name: "🔥 Fire", url: "https://cdn-icons-png.flaticon.com/512/833/83314.png", code: ":fire:" },
  { id: 2, name: "🤣 Haha", url: "https://cdn-icons-png.flaticon.com/512/742/742751.png", code: ":haha:" },
  { id: 3, name: "💖 Heart", url: "https://cdn-icons-png.flaticon.com/512/833/833472.png", code: ":heart:" },
  { id: 4, name: "🥺 UwU", url: "https://cdn-icons-png.flaticon.com/512/742/742920.png", code: ":uwu:" },
  { id: 5, name: "🤙 Chất", url: "https://cdn-icons-png.flaticon.com/512/2583/2583346.png", code: ":chat:" },
  { id: 6, name: "🐶 Cute", url: "https://cdn-icons-png.flaticon.com/512/616/616408.png", code: ":cute:" },
  { id: 7, name: "🎉 Party", url: "https://cdn-icons-png.flaticon.com/512/616/616495.png", code: ":party:" },
  { id: 8, name: "🌈 Rainbow", url: "https://cdn-icons-png.flaticon.com/512/616/616408.png", code: ":rainbow:" },
  { id: 9, name: "😎 Cool", url: "https://cdn-icons-png.flaticon.com/512/616/616490.png", code: ":cool:" },
  { id: 10, name: "🐧 Pengu", url: "https://cdn-icons-png.flaticon.com/512/616/616408.png", code: ":pengu:" },
  { id: 11, name: "🍀 Luck", url: "https://cdn-icons-png.flaticon.com/512/616/616524.png", code: ":luck:" },
  { id: 12, name: "🚀 Rocket", url: "https://cdn-icons-png.flaticon.com/512/616/616424.png", code: ":rocket:" },
];

interface LocationData {
  lat: number;
  lng: number;
  formatted?: string;
}
interface Comment {
  id: number;
  user: { name: string; avatar: string };
  content: string;
  createdAt: string;
}
interface MediaFile {
  type: "image" | "video";
  url: string;
  file?: File;
}
interface Post {
  id: number;
  user: { name: string; avatar: string };
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  location?: LocationData | null;
  locationEnabled?: boolean;
  media?: MediaFile | null;
  sticker?: typeof STICKERS[number] | null;
}
const demoUser = {
  name: "Bạn",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"
};

// === Helper để detect và render hashtag ===
const parseHashtags = (content: string, onHashtagClick: (tag: string) => void) => {
  if (!content) return null;
  const regex = /[#＃][\w\u00C0-\u1EF9\-]+/gu;
  const arr = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content))) {
    const start = match.index;
    const end = regex.lastIndex;
    if (start > lastIndex) {
      arr.push(content.slice(lastIndex, start));
    }
    arr.push(
      <span
        key={start}
        className="text-blue-600 font-semibold cursor-pointer hover:underline"
        onClick={() => onHashtagClick(match[0].slice(1))}
      >
        {content.slice(start, end)}
      </span>
    );
    lastIndex = end;
  }
  if (lastIndex < content.length) {
    arr.push(content.slice(lastIndex));
  }
  return arr;
};

import { useTimelinePosts } from "@/hooks/useTimelinePosts";
import { useTimelineComments } from "@/hooks/useTimelineComments";
import { usePostLikes } from "@/hooks/usePostLikes";
import { useDatingProfile } from "@/hooks/useDatingProfile";
import { useFakeUserInteractions } from "@/hooks/useFakeUserInteractions";
import { useFakePostComments } from "@/hooks/useFakePostComments";
import { useFakePostLikes } from "@/hooks/useFakePostLikes";

type TimelineProps = {
  user: any;
};

const Timeline: React.FC<TimelineProps> = ({ user }) => {
  const userId = user?.id;
  const { posts, isLoading, createPost, creating, refetch, deletePost, deleting } = useTimelinePosts(userId);
  const { profile } = useDatingProfile(userId);
  const [hashtag, setHashtag] = React.useState<string | null>(null);
  const fakeUserInteractions = useFakeUserInteractions(userId);
  const { toast } = useToast();

  // Realtime subscription for reply notifications
  React.useEffect(() => {
    if (!userId || !profile?.name) return;

    const channelName = `reply-notifications-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
      }, (payload: any) => {
        const newComment = payload.new;
        // Check if the comment mentions the current user
        if (newComment.content && newComment.user_id !== userId) {
          const mentionPattern = new RegExp(`@${profile.name}\\b`, 'i');
          if (mentionPattern.test(newComment.content)) {
            toast({
              title: "💬 Có người trả lời bình luận của bạn!",
              description: newComment.content.substring(0, 50) + (newComment.content.length > 50 ? "..." : ""),
            });
          }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fake_post_comments',
      }, (payload: any) => {
        const newComment = payload.new;
        // Check if the comment mentions the current user
        if (newComment.content && newComment.user_id !== userId) {
          const mentionPattern = new RegExp(`@${profile.name}\\b`, 'i');
          if (mentionPattern.test(newComment.content)) {
            toast({
              title: "💬 Có người trả lời bình luận của bạn!",
              description: newComment.content.substring(0, 50) + (newComment.content.length > 50 ? "..." : ""),
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, profile?.name, toast]);

  const handlePostSubmit = async (
    data: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt">
  ) => {
    await createPost({
      content: data.content,
      user_id: userId,
      media_url: data.media?.url,
      media_type: data.media?.type,
      location: data.location,
    });
    refetch();
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      toast({
        title: "Đã xóa bài viết",
        description: "Bài viết của bạn đã được xóa thành công.",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const { startChatWith } = useChatIntegration();

  const handleUserClick = (userId: string, userName: string, userAvatar: string) => {
    // Use unified chat system
    startChatWith({
      id: userId,
      name: userName,
      avatar: userAvatar
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 h-full flex flex-col animate-fade-in">
      {user && (
        <PostForm user={user} userProfile={profile} onCreate={handlePostSubmit} posting={creating} />
      )}
      
      <div className="flex-1 overflow-y-auto space-y-2 mt-3">
        {isLoading && (
          <div className="text-center text-gray-500 pt-12">Đang tải timeline...</div>
        )}
        {!isLoading && posts?.map((post: any) => (
          <PostItem 
            key={post.id} 
            post={post} 
            user={user} 
            onHashtagClick={setHashtag}
            onDeletePost={handleDeletePost}
            isDeleting={deleting}
          />
        ))}
        {posts?.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 pt-16">Chưa có bài viết nào.</div>
        )}
      </div>
      
      {hashtag && (
        <HashtagPostsModal
          hashtag={hashtag}
          open={!!hashtag}
          user={user}
          onClose={() => setHashtag(null)}
        />
      )}
    </div>
  );
};

const PostForm: React.FC<{
  user: any;
  userProfile: any;
  onCreate: (data: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt">) => Promise<void>;
  posting: boolean;
}> = ({ user, userProfile, onCreate, posting }) => {
  const [content, setContent] = React.useState("");
  const [media, setMedia] = React.useState<MediaFile | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const currentAvatar = userProfile?.avatar || user?.avatar || demoUser.avatar;
  const currentName = userProfile?.name || user?.name || demoUser.name;

  const handleMediaChange = async (e: ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const url = await uploadTimelineMedia(file);
      setMedia({
        type,
        url,
      });
    } catch (err) {
      alert("Upload file thất bại!");
    }
    setUploadingMedia(false);
  };

  const handleRemoveMedia = () => setMedia(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !media) || uploadingMedia) return;
    await onCreate({
      user: {
        name: currentName,
        avatar: currentAvatar
      },
      content: content.trim(),
      media: media ?? undefined,
    });
    setContent("");
    setMedia(null);
  };

  return (
    <Card className="mb-2 p-2 shadow-sm">
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <img src={currentAvatar} alt={currentName} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
        <div className="flex-1 w-full flex flex-col gap-1">
          <div className="relative">
            <Textarea
              ref={textAreaRef}
              className="flex-1 min-h-[50px] resize-none text-sm border-gray-200 py-2"
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={posting || uploadingMedia}
            />
          </div>
          
          {media && (
            <div className="relative mt-1 mb-1">
              {media.type === "image" ? (
                <img src={media.url} alt="preview" className="w-full rounded-md object-cover max-h-48" />
              ) : (
                <video src={media.url} controls className="w-full rounded-md max-h-48" />
              )}
              <button
                type="button"
                aria-label="Xóa media"
                className="absolute -top-1 -right-1 bg-white text-gray-600 hover:text-red-500 border rounded-full w-5 h-5 flex items-center justify-center shadow-md text-xs"
                onClick={handleRemoveMedia}
                tabIndex={-1}
                disabled={posting || uploadingMedia}
              >
                ×
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1 items-center">
              <label className="cursor-pointer flex gap-0.5 items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                <ImageIcon size={10} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleMediaChange(e, "image")}
                  disabled={posting || uploadingMedia}
                />
                <span>Ảnh</span>
              </label>
              <label className="cursor-pointer flex gap-0.5 items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                <VideoIcon size={10} />
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={e => handleMediaChange(e, "video")}
                  disabled={posting || uploadingMedia}
                />
                <span>Video</span>
              </label>
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-6 px-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 text-[10px]"
              disabled={posting || uploadingMedia}
            >
              {posting ? "Đang đăng..." : uploadingMedia ? "Đang tải..." : "Đăng"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

const PostItem: React.FC<{ 
  post: any; 
  user: any; 
  onHashtagClick: (tag: string) => void;
  onDeletePost: (postId: string) => void;
  isDeleting: boolean;
}> = ({ post, user, onHashtagClick, onDeletePost, isDeleting }) => {
  const [commentInput, setCommentInput] = React.useState("");
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const commentInputRef = React.useRef<HTMLInputElement>(null);
  const [showHeartAnimation, setShowHeartAnimation] = React.useState(false);
  const { toast } = useToast();

  const handleReply = (username: string) => {
    const mention = `@${username} `;
    setCommentInput(mention);
    commentInputRef.current?.focus();
  };

  // Parse @mentions in comment content
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@\S+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-500 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Use different hooks based on whether it's a fake user post
  const realPostComments = useTimelineComments(post.is_fake_user ? undefined : post.id);
  const fakePostComments = useFakePostComments(post.is_fake_user ? post.id : undefined);
  const realPostLikes = usePostLikes(post.is_fake_user ? undefined : post.id, user?.id);
  const fakePostLikes = useFakePostLikes(post.is_fake_user ? post.id : undefined, user?.id);
  
  const comments = post.is_fake_user ? fakePostComments.comments : realPostComments.comments;
  const commentsLoading = post.is_fake_user ? fakePostComments.isLoading : realPostComments.isLoading;
  const likeCount = post.is_fake_user ? fakePostLikes.likeCount : realPostLikes.likeCount;
  const liked = post.is_fake_user ? fakePostLikes.liked : realPostLikes.liked;
  const isToggling = post.is_fake_user ? false : realPostLikes.isToggling;
  
  const fakeUserInteractions = useFakeUserInteractions(user?.id);

  const navigate = useNavigate();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    if (post.is_fake_user) {
      // Comment on fake user post
      await fakeUserInteractions.commentOnFakePost({
        postId: post.id,
        content: commentInput
      });
    } else {
      // Comment on real user post
      await realPostComments.createComment({
        post_id: post.id,
        user_id: user?.id,
        content: commentInput,
      });
    }
    setCommentInput("");
  };

  const handleLike = async () => {
    // Trigger animation only when liking (not unliking)
    if (!liked) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
    
    if (post.is_fake_user) {
      // Like fake user post
      await fakeUserInteractions.likeFakePost(post.id);
    } else {
      // Like real user post
      if (liked) await realPostLikes.unlike();
      else await realPostLikes.like();
    }
  };

  const handleDeletePost = () => {
    onDeletePost(post.id);
    setShowDeleteDialog(false);
  };

  const isPostOwner = user?.id === post.user_id && !post.is_fake_user;

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200 mb-3 p-4 bg-white transition hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.user_avatar || demoUser.avatar}
            alt={post.user_name || "User"}
            className="w-10 h-10 rounded-full object-cover border shadow cursor-pointer"
            onClick={() => {
              if (post.user_id) {
                if (post.is_fake_user) {
                  navigate(`/fake-profile/${post.user_id}`);
                } else {
                  navigate(`/profile/${post.user_id}`);
                }
              }
            }}
          />
          <div className="flex flex-col">
            <span
              className="font-semibold text-gray-800 cursor-pointer hover:underline"
              onClick={() => {
                if (post.user_id) {
                  if (post.is_fake_user) {
                    navigate(`/fake-profile/${post.user_id}`);
                  } else {
                    navigate(`/profile/${post.user_id}`);
                  }
                }
              }}
            >
              {post.user_name || "Ẩn danh"}
            </span>
            <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString("vi-VN")}</span>
          </div>
        </div>
        
        {isPostOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa bài viết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="text-base text-gray-900 mb-3 whitespace-pre-line leading-relaxed" style={{ wordBreak: 'break-word' }}>
          {renderContent(post.content, onHashtagClick)}
        </div>
      )}
      
      {/* Media - Optimized for better viewing */}
      {post.media_url && post.media_type === "image" && (
        <div className="relative mb-3 -mx-1">
          <img
            src={post.media_url}
            alt="media"
            className="w-full rounded-lg object-cover cursor-pointer hover:opacity-95 transition-opacity"
            style={{ maxHeight: '500px' }}
            onClick={() => window.open(post.media_url, '_blank')}
          />
        </div>
      )}
      {post.media_url && post.media_type === "video" && (
        <div className="relative mb-3 -mx-1">
          <video
            src={post.media_url}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: '500px' }}
          />
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-4 mb-2 pt-1">
        <div className="relative">
          <Button
            size="sm"
            variant={liked ? "secondary" : "outline"}
            className={`transition-all rounded-full px-3 py-1.5 h-8 ${liked ? "text-pink-500 border-pink-400" : "border-gray-200"}`}
            onClick={handleLike}
            disabled={isToggling || !user?.id}
          >
            <Heart className={`${liked ? "fill-pink-500 text-pink-500" : ""} ${showHeartAnimation ? "animate-pulse-heart" : ""}`} size={16} />
            <span className="ml-1 text-sm">{likeCount > 0 ? likeCount : ""}</span>
          </Button>
          {/* Floating hearts animation */}
          {showHeartAnimation && (
            <>
              <Heart className="absolute -top-1 left-1/2 -translate-x-1/2 text-pink-500 fill-pink-500 animate-float-heart" size={14} />
              <Heart className="absolute -top-1 left-1/3 text-red-400 fill-red-400 animate-float-heart" size={10} style={{ animationDelay: '0.1s' }} />
              <Heart className="absolute -top-1 left-2/3 text-pink-400 fill-pink-400 animate-float-heart" size={12} style={{ animationDelay: '0.2s' }} />
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full px-3 py-1.5 h-8 text-blue-500 border-gray-200"
          tabIndex={-1}
          disabled
        >
          <MessageCircle size={16} />
          <span className="ml-1 text-sm">{comments?.length ?? 0}</span>
        </Button>
      </div>
      
      {/* Comments */}
      {comments && comments.length > 0 && (
        <div className="space-y-2 border-t pt-3 mt-2">
          {commentsLoading && <div className="text-sm text-gray-400 px-2">Đang tải bình luận...</div>}
          {comments.map((cmt: any) => (
            <div key={cmt.id} className="flex items-start gap-2">
              <img src={cmt.profiles?.avatar || demoUser.avatar} alt={cmt.profiles?.name || "User"} className="w-6 h-6 rounded-full object-cover border flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 leading-none mb-1">
                  <span className="font-semibold text-sm">{cmt.profiles?.name ?? "Ẩn danh"}</span>
                  {user?.id && (
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                      onClick={() => handleReply(cmt.profiles?.name ?? "Ẩn danh")}
                    >
                      Trả lời
                    </button>
                  )}
                  <span className="text-xs text-gray-400">{new Date(cmt.created_at).toLocaleTimeString("vi-VN")}</span>
                </div>
                <div className="text-sm text-gray-800">{renderCommentContent(cmt.content)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Comment Input */}
      {user?.id && (
        <form className="flex items-center gap-2 mt-2" onSubmit={handleCommentSubmit}>
          <Input
            ref={commentInputRef}
            className="h-8 text-sm bg-gray-50 border border-gray-200 flex-1"
            value={commentInput}
            placeholder="Viết bình luận..."
            onChange={e => setCommentInput(e.target.value)}
            disabled={realPostComments.creating || fakeUserInteractions.isProcessing}
          />
          <Button 
            type="submit" 
            size="sm" 
            variant="secondary" 
            className="aspect-square h-8 w-8 p-0 flex-shrink-0" 
            disabled={realPostComments.creating || fakeUserInteractions.isProcessing}
          >
            <SendHorizonal size={14} />
          </Button>
        </form>
      )}

      {!user?.id && (
        <div className="text-center text-gray-500 text-sm py-2 border-t mt-2">
          Đăng nhập để tương tác với bài viết
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const renderContent = (content: string, onHashtagClick: (tag: string) => void) => {
  if (!content) return null;
  return <>{parseHashtags(content, onHashtagClick)}</>;
};

export default Timeline;
