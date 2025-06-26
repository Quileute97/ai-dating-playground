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
  avatar: "https://source.unsplash.com/random/56x56?face"
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

type TimelineProps = {
  user: any;
};

const Timeline: React.FC<TimelineProps> = ({ user }) => {
  const userId = user?.id;
  const { posts, isLoading, createPost, creating, refetch, deletePost, deleting } = useTimelinePosts(userId);
  const { profile } = useDatingProfile(userId);
  const [hashtag, setHashtag] = React.useState<string | null>(null);
  const { toast } = useToast();

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
        <img src={currentAvatar} alt={currentName} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <div className="relative">
            <Textarea
              ref={textAreaRef}
              className="flex-1 min-h-[60px] resize-none text-sm border-gray-200"
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
            <div className="flex gap-1.5 items-center">
              <label className="cursor-pointer flex gap-1 items-center text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                <ImageIcon size={12} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleMediaChange(e, "image")}
                  disabled={posting || uploadingMedia}
                />
                <span>Ảnh</span>
              </label>
              <label className="cursor-pointer flex gap-1 items-center text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                <VideoIcon size={12} />
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
              className="h-7 px-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 text-xs"
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
  const { comments, isLoading: commentsLoading, createComment, creating } = useTimelineComments(post.id);
  const { likeCount, liked, like, unlike, isToggling } = usePostLikes(post.id, user?.id);

  const navigate = useNavigate();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    await createComment({
      post_id: post.id,
      user_id: user?.id,
      content: commentInput,
    });
    setCommentInput("");
  };

  const handleLike = async () => {
    if (liked) await unlike();
    else await like();
  };

  const handleDeletePost = () => {
    onDeletePost(post.id);
    setShowDeleteDialog(false);
  };

  const isPostOwner = user?.id === post.user_id;

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200 mb-3 p-4 bg-white transition hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.profiles?.avatar || demoUser.avatar}
            alt={post.profiles?.name || "User"}
            className="w-10 h-10 rounded-full object-cover border shadow cursor-pointer"
            onClick={() => post.profiles?.id && navigate(`/profile/${post.profiles.id}`)}
          />
          <div className="flex flex-col">
            <span
              className="font-semibold text-gray-800 cursor-pointer hover:underline"
              onClick={() => post.profiles?.id && navigate(`/profile/${post.profiles.id}`)}
            >
              {post.profiles?.name || "Ẩn danh"}
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
        <Button
          size="sm"
          variant={liked ? "secondary" : "outline"}
          className={`transition-all rounded-full px-3 py-1.5 h-8 ${liked ? "text-pink-500 border-pink-400" : "border-gray-200"}`}
          onClick={handleLike}
          disabled={isToggling}
        >
          <Heart className={liked ? "fill-pink-500 text-pink-500" : ""} size={16} />
          <span className="ml-1 text-sm">{likeCount > 0 ? likeCount : ""}</span>
        </Button>
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
                  <span className="text-xs text-gray-400">{new Date(cmt.created_at).toLocaleTimeString("vi-VN")}</span>
                </div>
                <div className="text-sm text-gray-800">{cmt.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Comment Input */}
      <form className="flex items-center gap-2 mt-2" onSubmit={handleCommentSubmit}>
        <Input
          className="h-8 text-sm bg-gray-50 border border-gray-200 flex-1"
          value={commentInput}
          placeholder="Viết bình luận..."
          onChange={e => setCommentInput(e.target.value)}
          disabled={creating}
        />
        <Button type="submit" size="sm" variant="secondary" className="aspect-square h-8 w-8 p-0 flex-shrink-0" disabled={creating}>
          <SendHorizonal size={14} />
        </Button>
      </form>

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
