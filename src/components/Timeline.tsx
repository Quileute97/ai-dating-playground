
import React, { useState } from "react";
import { Heart, MessageCircle, Share, Plus, MapPin, Smile, Hash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";
import { useTimelinePosts } from "@/hooks/useTimelinePosts";
import { useTimelineComments } from "@/hooks/useTimelineComments";
import { useTimelinePostLikes } from "@/hooks/useTimelinePostLikes";
import PostDetailModal from "./PostDetailModal";
import HashtagPostsModal from "./HashtagPostsModal";
import SimpleTimelineChatList from "./SimpleTimelineChatList";
import TimelineErrorBoundary from "./TimelineErrorBoundary";

interface TimelineProps {
  user?: any;
}

const TimelineContent = ({ user }: TimelineProps) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(false);

  const { toast } = useToast();
  const { posts, isLoading: postsLoading, createPost, deletePost } = useTimelinePosts();
  const { comments } = useTimelineComments();
  const { isPostLiked, getPostLikeCount, toggleLike, isToggling } = useTimelinePostLikes(user?.id);

  console.log('🔄 Timeline render - posts:', posts, 'user:', user);

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedFile && !selectedSticker && !selectedLocation) {
      toast({
        title: "Nội dung không được để trống!",
        description: "Vui lòng nhập nội dung hoặc chọn ảnh/video.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Lỗi đăng nhập!",
        description: "Vui lòng đăng nhập để đăng bài viết.",
        variant: "destructive",
      });
      return;
    }

    let mediaUrl = null;
    let mediaType = null;

    if (selectedFile) {
      try {
        const uploadResult = await uploadTimelineMedia(selectedFile);
        mediaUrl = uploadResult;
        mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Lỗi tải lên!",
          description: "Có lỗi khi tải lên ảnh/video. Vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }
    }

    const postData = {
      content: newPost,
      user_id: user.id,
      media_url: mediaUrl,
      media_type: mediaType,
      location: selectedLocation,
    };

    try {
      await createPost(postData);
      setNewPost("");
      setSelectedFile(null);
      setSelectedSticker(null);
      setSelectedLocation(null);
      setShowCreatePost(false);
      toast({
        title: "Đăng thành công!",
        description: "Bài viết của bạn đã được đăng lên timeline.",
      });
    } catch (error) {
      console.error('Create post error:', error);
      toast({
        title: "Lỗi đăng bài!",
        description: "Có lỗi khi đăng bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      toast({
        title: "Xóa thành công!",
        description: "Bài viết đã được xóa khỏi timeline.",
      });
    } catch (error) {
      console.error('Delete post error:', error);
      toast({
        title: "Lỗi xóa bài!",
        description: "Có lỗi khi xóa bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) {
      toast({
        title: "Cần đăng nhập!",
        description: "Vui lòng đăng nhập để thích bài viết.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleLike(postId);
    } catch (error) {
      console.error('Like error:', error);
      toast({
        title: "Lỗi thích bài!",
        description: "Có lỗi khi thích/bỏ thích bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const renderContentWithHashtags = (text: string) => {
    if (!text) return text;
    
    const hashtagRegex = /#(\w+)/g;
    const parts = [];
    let match;
    let lastIndex = 0;

    while ((match = hashtagRegex.exec(text)) !== null) {
      parts.push(text.substring(lastIndex, match.index));
      parts.push(
        <Button
          key={match.index}
          variant="link"
          onClick={() => setHashtagFilter(match[1])}
          className="p-0 m-0 h-auto text-blue-500 hover:text-blue-700"
        >
          #{match[1]}
        </Button>
      );
      lastIndex = match.index + match[0].length;
    }

    parts.push(text.substring(lastIndex));
    return parts;
  };

  const filteredPosts = hashtagFilter
    ? posts?.filter((post) => post.content && post.content.includes(`#${hashtagFilter}`)) || []
    : posts || [];

  if (postsLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      {/* Chat List Toggle */}
      {user && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChatList(true)}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Tin nhắn
        </Button>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Create Post Button */}
        {user && (
          <Card className="p-4">
            <Button
              onClick={() => setShowCreatePost(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo bài viết mới
            </Button>
          </Card>
        )}

        {/* Hashtag Filter */}
        {hashtagFilter && (
          <Card className="p-4 flex items-center justify-between">
            <h3 className="font-semibold">#{hashtagFilter}</h3>
            <Button variant="outline" size="sm" onClick={() => setHashtagFilter(null)}>
              <X className="w-4 h-4 mr-2" />
              Bỏ lọc
            </Button>
          </Card>
        )}

        {/* Create Post Modal */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo bài viết mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Bạn đang nghĩ gì?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="resize-none"
              />

              {/* Media Preview */}
              {selectedFile && (
                <div className="relative">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(selectedFile)}
                      controls
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/20 hover:bg-black/50 text-white rounded-full"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Sticker Preview */}
              {selectedSticker && (
                <div className="text-6xl">{selectedSticker.emoji}</div>
              )}

              {/* Location Preview */}
              {selectedLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  {selectedLocation.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedLocation(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label htmlFor="media-upload">
                    <Input
                      type="file"
                      id="media-upload"
                      accept="image/*, video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                    />
                    <Button variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </label>

                  <Button variant="outline" size="icon" onClick={() => setShowStickerPicker(!showStickerPicker)}>
                    <Smile className="w-4 h-4" />
                  </Button>

                  <Button variant="outline" size="icon" onClick={() => setShowLocationPicker(!showLocationPicker)}>
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>

                <Button onClick={handleCreatePost} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Đăng
                </Button>
              </div>

              {/* Sticker Picker */}
              {showStickerPicker && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {["💖", "😂", "🔥", "💯", "👏", "😎", "🤯", "🤔"].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      className="text-4xl"
                      onClick={() => {
                        setSelectedSticker({ emoji });
                        setShowStickerPicker(false);
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              )}

              {/* Location Picker */}
              {showLocationPicker && (
                <div className="mt-2">
                  <Input type="text" placeholder="Tìm kiếm địa điểm..." />
                  <div className="flex flex-col gap-1 mt-2">
                    {["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"].map((location) => (
                      <Button
                        key={location}
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          setSelectedLocation({ name: location });
                          setShowLocationPicker(false);
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Timeline Posts */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Chưa có bài viết nào.</p>
              {user && (
                <Button
                  onClick={() => setShowCreatePost(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Tạo bài viết đầu tiên
                </Button>
              )}
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.profiles?.avatar || "/placeholder.svg"}
                      alt={post.profiles?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{post.profiles?.name || "Anonymous"}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    {post.content && (
                      <p className="text-gray-800 mb-3">{renderContentWithHashtags(post.content)}</p>
                    )}
                    
                    {/* Media */}
                    {post.media_url && (
                      <div className="rounded-lg overflow-hidden">
                        {post.media_type === "image" ? (
                          <img
                            src={post.media_url}
                            alt="Post media"
                            className="w-full max-h-96 object-cover cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                          />
                        ) : (
                          <video
                            src={post.media_url}
                            controls
                            className="w-full max-h-96 object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Sticker */}
                    {post.sticker && typeof post.sticker === 'object' && (post.sticker as any).emoji && (
                      <div className="text-4xl mb-2">{(post.sticker as any).emoji}</div>
                    )}

                    {/* Location */}
                    {post.location && typeof post.location === 'object' && (post.location as any).name && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {(post.location as any).name}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        disabled={isToggling}
                        className={`${
                          isPostLiked(post.id) ? "text-red-500" : "text-gray-600"
                        } hover:text-red-500`}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isPostLiked(post.id) ? "fill-current" : ""}`} />
                        {getPostLikeCount(post.id)}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPost(post)}
                        className="text-gray-600 hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {comments?.filter(c => c.post_id === post.id).length || 0}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-green-500"
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Chia sẻ
                      </Button>
                    </div>
                    
                    {user && post.user_id === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        postId={selectedPost?.id || null}
      />

      {/* Hashtag Posts Modal */}
      <HashtagPostsModal
        open={!!hashtagFilter}
        onClose={() => setHashtagFilter(null)}
        hashtag={hashtagFilter || ""}
        user={user}
      />

      {/* Chat List */}
      {user && (
        <SimpleTimelineChatList
          currentUserId={user.id}
          isOpen={showChatList}
          onClose={() => setShowChatList(false)}
        />
      )}
    </div>
  );
};

const Timeline = ({ user }: TimelineProps) => {
  return (
    <TimelineErrorBoundary>
      <TimelineContent user={user} />
    </TimelineErrorBoundary>
  );
};

export default Timeline;
