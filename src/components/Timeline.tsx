import React, { useState, ChangeEvent } from "react";
import { User, MessageCircle, Heart, SendHorizonal, MapPin, Image as ImageIcon, Video as VideoIcon, Smile } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// -- Sticker data (Gen Z)
const STICKERS = [
  { id: 1, name: "🔥 Fire", url: "https://cdn-icons-png.flaticon.com/512/833/833314.png" },
  { id: 2, name: "🤣 Haha", url: "https://cdn-icons-png.flaticon.com/512/742/742751.png" },
  { id: 3, name: "💖 Heart", url: "https://cdn-icons-png.flaticon.com/512/833/833472.png" },
  { id: 4, name: "🥺 UwU", url: "https://cdn-icons-png.flaticon.com/512/742/742920.png" },
  { id: 5, name: "🤙 Chất", url: "https://cdn-icons-png.flaticon.com/512/2583/2583346.png" },
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
const initialPosts: Post[] = [
  {
    id: 1,
    user: {
      name: "Hà Linh",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg"
    },
    content: "Chào mọi người, hôm nay trời đẹp quá! ☀️",
    createdAt: "2 giờ trước",
    likes: 2,
    liked: false,
    comments: [
      {
        id: 1,
        user: {
          name: "Tuấn Anh",
          avatar: "https://randomuser.me/api/portraits/men/22.jpg"
        },
        content: "Đúng rồi đó, đi cafe không bạn?",
        createdAt: "1 giờ trước"
      }
    ],
    locationEnabled: true,
    location: {
      lat: 21.028511,
      lng: 105.804817,
      formatted: "Hà Nội",
    },
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&w=400&q=60",
    },
    sticker: STICKERS[0],
  },
  {
    id: 2,
    user: {
      name: "Minh Nhật",
      avatar: "https://randomuser.me/api/portraits/men/33.jpg"
    },
    content: "Có ai muốn join team chạy bộ vào sáng mai không?",
    createdAt: "4 giờ trước",
    likes: 1,
    liked: false,
    comments: [],
    locationEnabled: false
  }
];

// -- PostForm inline để tránh tạo file mới
const PostForm: React.FC<{
  user: any;
  onCreate: (data: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt">) => Promise<void>;
  posting: boolean;
}> = ({ user, onCreate, posting }) => {
  const [content, setContent] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [sticker, setSticker] = useState<typeof STICKERS[number] | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Choose media
  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMedia({
      type,
      url: URL.createObjectURL(file),
      file
    });
  };

  // Remove media
  const handleRemoveMedia = () => setMedia(null);

  // Get current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      setLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          formatted: `(${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`
        });
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 3000 }
    );
  };

  // Khi enable location checkbox thay đổi
  React.useEffect(() => {
    if (locationEnabled) getCurrentLocation();
    else setLocation(null);
    // eslint-disable-next-line
  }, [locationEnabled]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !media) return; // phải có text hoặc media
    await onCreate({
      user: {
        name: user?.name ?? demoUser.name,
        avatar: user?.avatar ?? demoUser.avatar
      },
      content: content.trim(),
      location: locationEnabled ? location : undefined,
      locationEnabled,
      media: media ?? undefined,
      sticker
    });
    setContent("");
    setLocationEnabled(false);
    setMedia(null);
    setSticker(null);
    setLocation(null);
  };

  return (
    <Card className="mb-6 p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row items-start">
        <img src={user?.avatar || demoUser.avatar} alt={user?.name || demoUser.name} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 w-full flex flex-col gap-2">
          <Textarea
            className="flex-1"
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={posting}
          />
          <div className="flex gap-2 flex-wrap items-center">
            {/* Upload buttons */}
            <label className="cursor-pointer flex gap-1 items-center text-sm px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200">
              <ImageIcon size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleMediaChange(e, "image")}
                disabled={posting}
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
                disabled={posting}
              />
              <span>Video</span>
            </label>
            {/* Sticker chooser */}
            <PopoverStickerSelect sticker={sticker} setSticker={setSticker} disabled={posting} />
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
                disabled={posting}
              >
                ×
              </button>
              {/* Hiển thị sticker overlay vào media preview */}
              {sticker && (
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="absolute left-2 bottom-2 w-10 h-10 z-10 drop-shadow"
                  style={{ filter: "drop-shadow(0 2px 8px #ffcfef)" }}
                />
              )}
            </div>
          )}
          {/* Hiển thị sticker nếu có và không có media */}
          {sticker && !media && (
            <div className="mt-1 mb-1 flex items-center gap-1">
              <img src={sticker.url} alt={sticker.name} className="w-9 h-9" />
              <span className="text-sm text-gray-500">{sticker.name}</span>
            </div>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer mt-1.5">
            <input
              type="checkbox"
              checked={locationEnabled}
              onChange={e => setLocationEnabled(e.target.checked)}
              className="accent-pink-500 w-4 h-4"
              disabled={posting || loadingLocation}
            />
            Cho phép hiển thị địa điểm của tôi
            <MapPin size={16} className="text-pink-500" />
            {locationEnabled && loadingLocation && <span className="text-xs text-gray-400 px-2">Đang lấy vị trí...</span>}
            {location && location.formatted && !loadingLocation && (
              <span className="text-xs text-green-500 pl-2">{location.formatted}</span>
            )}
          </label>
        </div>
        <Button
          type="submit"
          className="h-10 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 self-stretch sm:self-auto"
          disabled={posting}
        >
          {posting ? "Đang đăng..." : "Đăng"}
        </Button>
      </form>
    </Card>
  );
};

// Sticker chọn với Popover (inline)
const PopoverStickerSelect: React.FC<{
  sticker: typeof STICKERS[number] | null;
  setSticker: (sticker: typeof STICKERS[number] | null) => void;
  disabled?: boolean;
}> = ({ sticker, setSticker, disabled }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        type="button"
        className={cn("px-2 py-0 rounded-md", open && "bg-pink-100")}
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        <Smile size={17} />
        <span className="text-xs hidden sm:inline">Sticker</span>
        {sticker && <img src={sticker.url} alt="" className="w-5 h-5 mx-1 inline" />}
      </Button>
      {open && (
        <div className="absolute left-0 top-10 z-30 grid grid-cols-3 gap-2 p-2 bg-white shadow-xl rounded-xl border border-gray-200 min-w-[160px] animate-fade-in" tabIndex={0}>
          {STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                "hover:bg-pink-50 p-1 rounded-md transition",
                sticker?.id === s.id ? "ring-2 ring-pink-400 ring-offset-2" : ""
              )}
              onClick={() => {
                setSticker(s);
                setOpen(false);
              }}
              tabIndex={0}
            >
              <img src={s.url} alt={s.name} className="w-8 h-8 mx-auto" />
            </button>
          ))}
          <button
            type="button"
            className="text-gray-500 col-span-3 border-t pt-1 mt-1 text-xs hover:text-red-400"
            onClick={() => {
              setSticker(null);
              setOpen(false);
            }}
          >Bỏ sticker</button>
        </div>
      )}
    </div>
  );
};

import { useTimelinePosts } from "@/hooks/useTimelinePosts";
import { useTimelineComments } from "@/hooks/useTimelineComments";
import { usePostLikes } from "@/hooks/usePostLikes";

const Timeline: React.FC<{ user: any }> = ({ user }) => {
  const userId = user?.id;
  const { posts, isLoading, createPost, creating, refetch } = useTimelinePosts(userId);

  // Xử lý đăng post mới (dùng Supabase)
  const handlePostSubmit = async (
    data: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt">
  ) => {
    await createPost({
      content: data.content,
      user_id: userId,
      media_url: data.media?.url,
      media_type: data.media?.type,
      sticker: data.sticker,
      location: data.location,
    });
    refetch();
  };

  return (
    <div className="max-w-lg mx-auto py-6 h-full flex flex-col animate-fade-in">
      {/* Đăng bài mới */}
      <PostForm user={user} onCreate={handlePostSubmit} posting={creating} />

      {/* Danh sách bài viết */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {isLoading && (
          <div className="text-center text-gray-500 pt-14">Đang tải timeline...</div>
        )}
        {!isLoading && posts?.map((post: any) => (
          <PostItem key={post.id} post={post} user={user} />
        ))}
        {posts?.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 pt-14">Chưa có bài viết nào.</div>
        )}
      </div>
    </div>
  );
};

// Tách nhỏ PostItem để dễ kiểm soát
const PostItem: React.FC<{ post: any; user: any }> = ({ post, user }) => {
  const [commentInput, setCommentInput] = React.useState("");
  const { comments, isLoading: commentsLoading, createComment, creating } = useTimelineComments(post.id);
  const { likeCount, liked, like, unlike, isToggling } = usePostLikes(post.id, user?.id);

  // Gửi bình luận cho bài viết
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

  // Like / Unlike
  const handleLike = async () => {
    if (liked) await unlike();
    else await like();
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3 items-center mb-2">
        <img src={post.profiles?.avatar || demoUser.avatar} alt={post.profiles?.name || "User"} className="w-9 h-9 rounded-full object-cover" />
        <div>
          <div className="font-bold text-gray-800">{post.profiles?.name || "Ẩn danh"}</div>
          <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString("vi-VN")}</div>
        </div>
      </div>
      <div className="text-base text-gray-800 mb-2 whitespace-pre-line">{post.content}</div>
      {/* Media */}
      {post.media_url && post.media_type === "image" && (
        <div className="mb-2 ml-12 relative w-72 max-w-full">
          <img src={post.media_url} alt="media" className="rounded-xl shadow-sm max-h-60 w-full object-cover" />
          {post.sticker && (
            <img
              src={post.sticker.url}
              alt={post.sticker.name}
              className="absolute left-4 bottom-2 w-10 h-10 z-20 drop-shadow"
              style={{ filter: "drop-shadow(0 2px 8px #ffcfef)" }}
            />
          )}
        </div>
      )}
      {post.media_url && post.media_type === "video" && (
        <div className="mb-2 ml-12 relative w-72 max-w-full">
          <video src={post.media_url} controls className="rounded-xl shadow-sm max-h-64 w-full" />
          {post.sticker && (
            <img src={post.sticker.url} alt={post.sticker.name} className="absolute left-4 bottom-2 w-10 h-10 z-20 drop-shadow" style={{ filter: "drop-shadow(0 2px 8px #ffcfef)" }} />
          )}
        </div>
      )}
      {!post.media_url && post.sticker && (
        <div className="mb-2 ml-12 flex items-center gap-2">
          <img src={post.sticker.url} alt={post.sticker.name} className="w-9 h-9" />
          <span className="text-xs text-gray-500">{post.sticker.name}</span>
        </div>
      )}
      {/* Location */}
      {post.location && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2 ml-12">
          <MapPin size={13} className="text-pink-400" />
          <span>
            Vị trí: {post.location.formatted ? post.location.formatted : `${post.location.lat}, ${post.location.lng}`}
          </span>
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-4 mb-2">
        <Button
          size="sm"
          variant={liked ? "secondary" : "ghost"}
          className={`transition-all ${liked ? "text-pink-500" : ""}`}
          onClick={handleLike}
          disabled={isToggling}
        >
          <Heart className={liked ? "fill-pink-500 text-pink-500" : ""} size={18} />
          <span>{likeCount > 0 ? likeCount : ""}</span>
        </Button>
        <Button size="sm" variant="ghost" className="text-blue-500">
          <MessageCircle size={18} />
          <span> {comments?.length ?? 0} </span>
        </Button>
      </div>
      {/* Comment list */}
      <div className="space-y-2">
        {commentsLoading && <div className="text-xs text-gray-400 px-2">Đang tải bình luận...</div>}
        {comments && comments.map((cmt: any) => (
          <div key={cmt.id} className="flex items-center gap-2 ml-4">
            <img src={cmt.profiles?.avatar || demoUser.avatar} alt={cmt.profiles?.name || "User"} className="w-7 h-7 rounded-full object-cover" />
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <span className="font-bold text-xs mr-2">{cmt.profiles?.name ?? "Ẩn danh"}</span>
              <span>{cmt.content}</span>
            </div>
            <span className="text-xs text-gray-400">{new Date(cmt.created_at).toLocaleTimeString("vi-VN")}</span>
          </div>
        ))}
      </div>
      {/* Comment input */}
      <form className="flex items-center gap-2 mt-2 ml-2" onSubmit={handleCommentSubmit}>
        <Input
          className="h-8 text-sm"
          value={commentInput}
          placeholder="Viết bình luận..."
          onChange={e => setCommentInput(e.target.value)}
          disabled={creating}
        />
        <Button type="submit" size="sm" variant="secondary" className="aspect-square h-8 w-8 p-0" disabled={creating}>
          <SendHorizonal size={16} />
        </Button>
      </form>
    </Card>
  );
};

export default Timeline;

// Lưu ý: File này quá dài, bạn nên tách PostForm, PopoverStickerSelect, PostCard ra file riêng cho dễ maintain!
