import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { usePostLikes } from "@/hooks/usePostLikes";
import { useTimelineComments } from "@/hooks/useTimelineComments";
import { useFakePostComments } from "@/hooks/useFakePostComments";
import { useFakePostLikes } from "@/hooks/useFakePostLikes";
import { useFakeUserInteractions } from "@/hooks/useFakeUserInteractions";
import { getDefaultAvatar } from "@/utils/getDefaultAvatar";
import { Heart, MessageCircle, SendHorizonal, ArrowLeft, Home, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFakePost, setIsFakePost] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);

    // Try real post first
    supabase
      .from("posts")
      .select("*, profiles:user_id (id, name, avatar, gender)")
      .eq("id", postId)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setPost({
            ...data,
            user_name: data.profiles?.name,
            user_avatar: data.profiles?.avatar,
            user_gender: data.profiles?.gender,
            user_id: data.user_id,
          });
          setIsFakePost(false);
          setLoading(false);
        } else {
          // Try fake user post
          supabase
            .from("fake_user_posts")
            .select("*, fake_users:fake_user_id (id, name, avatar, gender)")
            .eq("id", postId)
            .single()
            .then(({ data: fakeData }) => {
              if (fakeData) {
                setPost({
                  ...fakeData,
                  user_name: fakeData.fake_users?.name,
                  user_avatar: fakeData.fake_users?.avatar,
                  user_gender: fakeData.fake_users?.gender,
                  user_id: fakeData.fake_user_id,
                });
                setIsFakePost(true);
              }
              setLoading(false);
            });
        }
      });
  }, [postId]);

  const realPostLikes = usePostLikes(!isFakePost ? postId : undefined, currentUser?.id);
  const fakePostLikes = useFakePostLikes(isFakePost ? postId : undefined, currentUser?.id);
  const realPostComments = useTimelineComments(!isFakePost ? postId : undefined);
  const fakePostComments = useFakePostComments(isFakePost ? postId : undefined);
  const fakeUserInteractions = useFakeUserInteractions(currentUser?.id);

  const likeCount = isFakePost ? fakePostLikes.likeCount : realPostLikes.likeCount;
  const liked = isFakePost ? fakePostLikes.liked : realPostLikes.liked;
  const comments = isFakePost ? fakePostComments.comments : realPostComments.comments;

  const handleLike = async () => {
    if (!currentUser?.id) return;
    if (isFakePost) {
      await fakeUserInteractions.likeFakePost(postId!);
    } else {
      if (liked) await realPostLikes.unlike();
      else await realPostLikes.like();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser?.id) return;
    if (isFakePost) {
      await fakeUserInteractions.commentOnFakePost({ postId: postId!, content: commentInput });
    } else {
      await realPostComments.createComment({ post_id: postId!, user_id: currentUser.id, content: commentInput });
    }
    setCommentInput("");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.user_name ? `Bài viết của ${post.user_name}` : "Bài viết", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Đã sao chép link", description: "Link bài viết đã được sao chép vào clipboard." });
    }
  };

  const handleBackClick = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <div className="text-gray-600 text-lg mb-4">Không tìm thấy bài viết.</div>
          <Button onClick={handleBackClick} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Quay lại</Button>
        </div>
      </div>
    );
  }

  const postUrl = `https://hyliya.com/post/${postId}`;

  return (
    <>
      <SEOHead
        title={`${post.user_name || "Người dùng"} - Bài viết | Hyliya`}
        description={post.content?.slice(0, 160) || "Xem bài viết trên Hyliya"}
        keywords="bài viết, timeline, hyliya"
        image={post.media_url || post.user_avatar || "https://hyliya.com/og-image.jpg"}
        url={postUrl}
        type="article"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button onClick={handleBackClick} variant="ghost" size="sm"><ArrowLeft className="w-5 h-5 mr-2" />Quay lại</Button>
            <h1 className="font-semibold text-gray-800">Bài viết</h1>
            <Button onClick={() => navigate("/")} variant="ghost" size="sm"><Home className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto py-6 px-4">
          <Card className="p-4 bg-white/90 backdrop-blur-sm shadow-xl border-0">
            {/* Post header */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={getDefaultAvatar(post.user_gender, post.user_avatar)}
                alt={post.user_name}
                className="w-10 h-10 rounded-full object-cover border shadow cursor-pointer"
                onClick={() => {
                  if (isFakePost) navigate(`/u/${post.user_id}`);
                  else navigate(`/profile/${post.user_id}`);
                }}
              />
              <div className="flex-1">
                <span
                  className="font-semibold text-gray-800 cursor-pointer hover:underline"
                  onClick={() => {
                    if (isFakePost) navigate(`/u/${post.user_id}`);
                    else navigate(`/profile/${post.user_id}`);
                  }}
                >
                  {post.user_name || "Ẩn danh"}
                </span>
                <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString("vi-VN")}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 w-8 p-0">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            {post.content && (
              <div className="text-base text-gray-900 mb-3 whitespace-pre-line leading-relaxed" style={{ wordBreak: "break-word" }}>
                {post.content}
              </div>
            )}

            {/* Media */}
            {post.media_url && post.media_type === "image" && (
              <img src={post.media_url} alt="media" className="w-full rounded-lg object-cover mb-3" style={{ maxHeight: "500px" }} />
            )}
            {post.media_url && post.media_type === "video" && (
              <video src={post.media_url} controls className="w-full rounded-lg mb-3" style={{ maxHeight: "500px" }} />
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mb-2 pt-1">
              <Button
                size="sm"
                variant={liked ? "secondary" : "outline"}
                className={`rounded-full px-3 py-1.5 h-8 ${liked ? "text-pink-500 border-pink-400" : "border-gray-200"}`}
                onClick={handleLike}
                disabled={!currentUser?.id}
              >
                <Heart className={liked ? "fill-pink-500 text-pink-500" : ""} size={16} />
                <span className="ml-1 text-sm">{likeCount > 0 ? likeCount : ""}</span>
              </Button>
              <Button size="sm" variant="outline" className="rounded-full px-3 py-1.5 h-8 text-blue-500 border-gray-200" disabled>
                <MessageCircle size={16} />
                <span className="ml-1 text-sm">{comments?.length ?? 0}</span>
              </Button>
              <Button size="sm" variant="outline" className="rounded-full px-3 py-1.5 h-8 border-gray-200" onClick={handleShare}>
                <Share2 size={16} />
                <span className="ml-1 text-sm">Chia sẻ</span>
              </Button>
            </div>

            {/* Comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-2 border-t pt-3 mt-2">
                {comments.map((cmt: any) => (
                  <div key={cmt.id} className="flex items-start gap-2">
                    <img src={getDefaultAvatar(cmt.profiles?.gender, cmt.profiles?.avatar)} alt={cmt.profiles?.name || "User"} className="w-6 h-6 rounded-full object-cover border flex-shrink-0" />
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

            {/* Comment input */}
            {currentUser?.id ? (
              <form className="flex items-center gap-2 mt-2" onSubmit={handleCommentSubmit}>
                <Input className="h-8 text-sm bg-gray-50 border border-gray-200 flex-1" value={commentInput} placeholder="Viết bình luận..." onChange={e => setCommentInput(e.target.value)} />
                <Button type="submit" size="sm" variant="secondary" className="aspect-square h-8 w-8 p-0 flex-shrink-0" disabled={!commentInput.trim()}>
                  <SendHorizonal size={14} />
                </Button>
              </form>
            ) : (
              <div className="text-center text-gray-500 text-sm py-2 border-t mt-2">Đăng nhập để tương tác với bài viết</div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default PostPage;
