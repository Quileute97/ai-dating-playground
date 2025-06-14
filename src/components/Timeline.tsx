import React, { useState, ChangeEvent } from "react";
import { User, MessageCircle, Heart, SendHorizonal, MapPin, Image as ImageIcon, Video as VideoIcon, Smile } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";
import { VN_PROVINCES } from "@/utils/vnProvinces";
import HashtagPostsModal from "./HashtagPostsModal";

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

const Timeline: React.FC<{ user: any }> = ({ user }) => {
  const userId = user?.id;
  const { posts, isLoading, createPost, creating, refetch } = useTimelinePosts(userId);
  const [hashtag, setHashtag] = React.useState<string | null>(null);

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
      <PostForm user={user} onCreate={handlePostSubmit} posting={creating} />
      <div className="flex-1 overflow-y-auto space-y-3 mt-2">
        {isLoading && (
          <div className="text-center text-gray-500 pt-12">Đang tải timeline...</div>
        )}
        {!isLoading && posts?.map((post: any) => (
          <PostItem key={post.id} post={post} user={user} onHashtagClick={setHashtag} />
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
// Thay đổi truyền locationName, sticker insert vào position cursor
const PostForm: React.FC<{
  user: any;
  onCreate: (data: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt">) => Promise<void>;
  posting: boolean;
}> = ({ user, onCreate, posting }) => {
  const [content, setContent] = React.useState("");
  const [media, setMedia] = React.useState<MediaFile | null>(null);
  const [sticker, setSticker] = React.useState<typeof STICKERS[number] | null>(null);

  // NEW: loading state cho upload ảnh/video
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // --- Chèn sticker vào đúng vị trí con trỏ soạn thảo
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleStickerInsert = (code: string) => {
    const el = textAreaRef.current;
    if (!el) return;
    const [start, end] = [el.selectionStart, el.selectionEnd];
    const before = content.slice(0, start);
    const after = content.slice(end);
    const next = before + " " + code + " " + after;
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + code.length + 2;
    }, 0);
  };

  // Chọn media và upload lên Supabase Storage (đã thay thế anh.moe)
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

  // Remove media
  const handleRemoveMedia = () => setMedia(null);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !media) || uploadingMedia) return;
    await onCreate({
      user: {
        name: user?.name ?? demoUser.name,
        avatar: user?.avatar ?? demoUser.avatar
      },
      content: content.trim(),
      // bỏ location
      media: media ?? undefined,
      sticker,
    });
    setContent("");
    setMedia(null);
    setSticker(null);
  };

  return (
    <Card className="mb-6 p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row items-start">
        <img src={user?.avatar || demoUser.avatar} alt={user?.name || demoUser.name} className="w-10 h-10 rounded-full object-cover" />
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
            {/* Sticker Selector (small inline) */}
            <div className="absolute right-2 top-2 flex flex-nowrap gap-1 z-20">
              {STICKERS.slice(0, 6).map(s => (
                <button
                  key={s.id}
                  type="button"
                  tabIndex={-1}
                  className="w-7 h-7 hover:scale-110 transition"
                  title={s.name}
                  disabled={posting || uploadingMedia}
                  onClick={() => handleStickerInsert(s.code)}
                >
                  <img src={s.url} alt={s.name} className="w-full h-full" />
                </button>
              ))}
              <PopoverStickerSelect onSticker={s => handleStickerInsert(s.code)} disabled={posting || uploadingMedia} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Upload buttons */}
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

// ---------- Sửa PopoverStickerSelect
const PopoverStickerSelect: React.FC<{ onSticker: (s: typeof STICKERS[number]) => void, disabled?: boolean }> = ({ onSticker, disabled }) => {
  const [open, setOpen] = React.useState(false);
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
      </Button>
      {open && (
        <div className="absolute left-0 top-10 z-30 grid grid-cols-5 gap-2 p-2 bg-white shadow-xl rounded-xl border border-gray-200 min-w-[220px] animate-fade-in">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                "hover:bg-pink-50 p-1 rounded-md transition"
              )}
              onClick={() => { onSticker(s); setOpen(false); }}
              tabIndex={0}
              disabled={disabled}
            >
              <img src={s.url} alt={s.name} className="w-8 h-8 mx-auto" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
};

// ---------- Sửa lại giao diện PostItem (gọn đẹp như cũ, tối giản, spacing ổn) ---
const PostItem: React.FC<{ post: any; user: any; onHashtagClick: (tag: string) => void }> = ({ post, user, onHashtagClick }) => {
  const [commentInput, setCommentInput] = React.useState("");
  const { comments, isLoading: commentsLoading, createComment, creating } = useTimelineComments(post.id);
  const { likeCount, liked, like, unlike, isToggling } = usePostLikes(post.id, user?.id);

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

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 mb-4 p-5 bg-white transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post.profiles?.avatar || demoUser.avatar}
          alt={post.profiles?.name || "User"}
          className="w-11 h-11 rounded-full object-cover border shadow"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{post.profiles?.name || "Ẩn danh"}</span>
          <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString("vi-VN")}</span>
        </div>
      </div>
      <div className="text-base text-gray-900 mb-2 whitespace-pre-line leading-relaxed min-h-[18px]" style={{ wordBreak: 'break-word' }}>
        {renderContent(post.content, onHashtagClick)}
      </div>
      {/* Media và sticker */}
      {post.media_url && post.media_type === "image" && (
        <div className="relative flex items-center justify-center mt-2 mb-3">
          <img
            src={post.media_url}
            alt="media"
            className="rounded-lg object-cover border max-h-72 w-full"
            style={{ maxWidth: '98%' }}
          />
          {post.sticker && (
            <img
              src={post.sticker.url}
              alt={post.sticker.name}
              className="absolute left-4 bottom-3 w-11 h-11 z-10"
              style={{ filter: "drop-shadow(0 3px 12px #ffcfef)" }}
            />
          )}
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
          {post.sticker && (
            <img
              src={post.sticker.url}
              alt={post.sticker.name}
              className="absolute left-4 bottom-3 w-11 h-11 z-10"
              style={{ filter: "drop-shadow(0 3px 12px #ffcfef)" }}
            />
          )}
        </div>
      )}
      {!post.media_url && post.sticker && (
        <div className="mb-2 flex items-center gap-2">
          <img src={post.sticker.url} alt={post.sticker.name} className="w-7 h-7" />
          <span className="text-xs text-gray-500">{post.sticker.name}</span>
        </div>
      )}
      {/* Địa điểm đã bị loại bỏ */}
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
    </Card>
  );
};

// ---------- Sửa renderContent ----------
const stickerCodeToImg: Record<string, string> = Object.fromEntries(STICKERS.map(x => [x.code, x.url]));

// mình cần render sticker trong nội dung text nếu có mã sticker như ":fire:"
// Ta sẽ parse và convert sang icon sticker
const renderContent = (content: string, onHashtagClick: (tag: string) => void) => {
  if (!content) return null;
  // Replace stickerCode in content
  let parts: Array<string | { sticker: string } > = [];
  const regex = /(:\w+:)/g;
  let last = 0;
  let m;
  while ((m = regex.exec(content))) {
    if (m.index > last) parts.push(content.slice(last, m.index));
    parts.push({ sticker: m[1] });
    last = m.index + m[0].length;
  }
  if (last < content.length) parts.push(content.slice(last));
  // Render部分
  return parts.map((p, i) => {
    if (typeof p === "string") {
      return <React.Fragment key={i}>{parseHashtags(p, onHashtagClick)}</React.Fragment>;
    }
    // Sticker
    const url = stickerCodeToImg[p.sticker];
    if (url) return <img key={i} src={url} alt={p.sticker} className="inline w-6 h-6 mx-0.5 align-text-bottom" />;
    return p.sticker;
  });
};

export default Timeline;

// Lưu ý: File này quá dài, bạn nên tách PostForm, PopoverStickerSelect, PostCard ra file riêng cho dễ maintain!
