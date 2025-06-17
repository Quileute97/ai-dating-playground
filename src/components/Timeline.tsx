import React, { useState, ChangeEvent } from "react";
import { User, MessageCircle, Heart, SendHorizonal, MapPin, Image as ImageIcon, Video as VideoIcon, Smile, MoreHorizontal, Trash2 } from "lucide-react";
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
  // ... bạn thêm nhiều sticker tùy thích
];

// Sticker style: square, size 56x56

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

const Timeline: React.FC<{ user: any }> = ({ user }) => {
  const userId = user?.id;
  const { posts, isLoading, createPost, creating, refetch, deletePost, deleting } = useTimelinePosts(userId);
  const { profile } = useDatingProfile(userId);
  const [hashtag, setHashtag] = React.useState<string | null>(null);

  // Xử lý đăng post mới (KHÔNG truyền sticker)
  const handlePostSubmit = async (
    data: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt">
  ) => {
    await createPost({
      content: data.content,
      user_id: userId,
      media_url: data.media?.url,
      media_type: data.media?.type,
      // sticker: data.sticker, // LOẠI BỎ sticker
      location: data.location,
    });
    refetch();
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6 h-full flex flex-col animate-fade-in">
      {/* CHỈ HIỂN THỊ PostForm NẾU ĐÃ ĐĂNG NHẬP */}
      {user && (
        <PostForm user={user} userProfile={profile} onCreate={handlePostSubmit} posting={creating} />
      )}
      <div className="flex-1 overflow-y-auto space-y-3 mt-2">
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
      {/* Modal hashtag */}
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

// ---------- Sửa PostForm ----------
// BỎ sticker liên quan UI/state
const PostForm: React.FC<{
  user: any;
  userProfile: any;
  onCreate: (data: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt">) => Promise<void>;
  posting: boolean;
}> = ({ user, userProfile, onCreate, posting }) => {
  const [content, setContent] = React.useState("");
  const [media, setMedia] = React.useState<MediaFile | null>(null);
  // const [sticker, setSticker] = React.useState<typeof STICKERS[number] | null>(null); // BỎ sticker

  const [uploadingMedia, setUploadingMedia] = useState(false);

  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Lấy avatar từ profile hoặc fallback
  const currentAvatar = userProfile?.avatar || user?.avatar || demoUser.avatar;
  const currentName = userProfile?.name || user?.name || demoUser.name;

  // BỎ handleStickerInsert

  // Chọn media và upload lên Supabase Storage (giữ nguyên)
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
      // sticker: sticker, // BỎ sticker không truyền nữa
    });
    setContent("");
    setMedia(null);
    // setSticker(null); // BỎ
  };

  return (
    <Card className="mb-6 p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row items-start">
        <img src={currentAvatar} alt={currentName} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="relative">
            <Textarea
              ref={textAreaRef}
              className="flex-1 pr-24"
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={posting || uploadingMedia}
            />
            {/* BỎ Sticker Selector UI */}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Upload buttons giữ nguyên */}
            <label className="cursor-pointer flex gap-1 items-center text-sm px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200">
              <ImageIcon size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleMediaChange(e, "image")}
                disabled={posting || uploadingMedia}
              />
              <span>Ảnh</span>
            </label>
            <label className="cursor-pointer flex gap-1 items-center text-sm px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200">
              <VideoIcon size={16} />
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
          {/* Media preview */}
          {media && (
            <div className="relative mt-2 mb-2 w-36">
              {media.type === "image" ? (
                <img src={media.url} alt="preview" className="w-full rounded-lg object-cover max-h-48" />
              ) : (
                <video src={media.url} controls className="w-full rounded-lg max-h-48" />
              )}
              <button
                type="button"
                aria-label="Xóa media"
                className="absolute -top-3 -right-3 bg-white text-gray-600 hover:text-red-500 border rounded-full w-7 h-7 flex items-center justify-center shadow-md"
                onClick={handleRemoveMedia}
                tabIndex={-1}
                disabled={posting || uploadingMedia}
              >
                ×
              </button>
              {/* KHÔNG hiển thị sticker overlay nữa */}
            </div>
          )}
          {/* KHÔNG hiển thị sticker nếu không có media */}
          {/* Địa điểm đã bị loại bỏ */}
        </div>
        <Button
          type="submit"
          className="h-10 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 self-stretch sm:self-auto"
          disabled={posting || uploadingMedia}
        >
          {posting ? "Đang đăng..." : uploadingMedia ? "Đang tải file..." : "Đăng"}
        </Button>
      </form>
    </Card>
  );
};

// ---------- BỎ COMPONENT PopoverStickerSelect ----------
// (Component này chỉ dùng cho sticker, đã bỏ hoàn toàn)

// ---------- Sửa PostItem ----------
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

  // Kiểm tra xem user hiện tại có phải là chủ bài viết không
  const isPostOwner = user?.id === post.user_id;

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 mb-4 p-5 bg-white transition hover:shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img
            src={post.profiles?.avatar || demoUser.avatar}
            alt={post.profiles?.name || "User"}
            className="w-11 h-11 rounded-full object-cover border shadow cursor-pointer"
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
        
        {/* Menu xóa bài viết - chỉ hiển thị cho chủ bài viết */}
        {isPostOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa bài viết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="text-base text-gray-900 mb-2 whitespace-pre-line leading-relaxed min-h-[18px]" style={{ wordBreak: 'break-word' }}>
        {renderContent(post.content, onHashtagClick)}
      </div>
      {/* Media */}
      {post.media_url && post.media_type === "image" && (
        <div className="relative flex items-center justify-center mt-2 mb-3">
          <img
            src={post.media_url}
            alt="media"
            className="rounded-lg object-cover border max-h-72 w-full"
            style={{ maxWidth: '98%' }}
          />
        </div>
      )}
      {post.media_url && post.media_type === "video" && (
        <div className="relative flex items-center justify-center mt-2 mb-3">
          <video
            src={post.media_url}
            controls
            className="rounded-lg object-contain border max-h-72 w-full"
            style={{ maxWidth: '98%' }}
          />
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-4 mt-2 mb-2">
        <Button
          size="sm"
          variant={liked ? "secondary" : "outline"}
          className={`transition-all rounded-full px-3 py-1 ${liked ? "text-pink-500 border-pink-400" : "border-gray-200"}`}
          onClick={handleLike}
          disabled={isToggling}
        >
          <Heart className={liked ? "fill-pink-500 text-pink-500" : ""} size={17} />
          <span className="ml-1">{likeCount > 0 ? likeCount : ""}</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full px-3 py-1 text-blue-500 border-gray-200"
          tabIndex={-1}
          disabled
        >
          <MessageCircle size={17} />
          <span className="ml-1">{comments?.length ?? 0}</span>
        </Button>
      </div>
      {/* Danh sách bình luận */}
      {comments && comments.length > 0 && (
        <div className="space-y-1.5 border-t pt-3 mt-2">
          {commentsLoading && <div className="text-sm text-gray-400 px-2">Đang tải bình luận...</div>}
          {comments.map((cmt: any) => (
            <div key={cmt.id} className="flex items-start gap-2">
              <img src={cmt.profiles?.avatar || demoUser.avatar} alt={cmt.profiles?.name || "User"} className="w-7 h-7 rounded-full object-cover border" />
              <div>
                <div className="flex items-center gap-2 leading-none">
                  <span className="font-semibold text-xs">{cmt.profiles?.name ?? "Ẩn danh"}</span>
                  <span className="text-[11px] text-gray-400">{new Date(cmt.created_at).toLocaleTimeString("vi-VN")}</span>
                </div>
                <div className="text-xs text-gray-800 pl-1">{cmt.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Input bình luận */}
      <form className="flex items-center gap-2 mt-1" onSubmit={handleCommentSubmit}>
        <Input
          className="h-8 text-sm bg-gray-50 border border-gray-200"
          value={commentInput}
          placeholder="Viết bình luận..."
          onChange={e => setCommentInput(e.target.value)}
          disabled={creating}
        />
        <Button type="submit" size="sm" variant="secondary" className="aspect-square h-8 w-8 p-0" disabled={creating}>
          <SendHorizonal size={16} />
        </Button>
      </form>

      {/* Dialog xác nhận xóa */}
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

// ---------- Sửa renderContent: BỎ sticker code parsing ----------
const renderContent = (content: string, onHashtagClick: (tag: string) => void) => {
  if (!content) return null;
  // KHÔNG replace stickerCode, chỉ parse hashtag
  return <>{parseHashtags(content, onHashtagClick)}</>;
};

export default Timeline;

// ... keep existing code (cuối file, export, lưu ý refactor)
