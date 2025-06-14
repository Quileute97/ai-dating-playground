
import React, { useState } from "react";
import { User, MessageCircle, Heart, SendHorizonal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: number;
  user: { name: string; avatar: string };
  content: string;
  createdAt: string;
}

interface Post {
  id: number;
  user: { name: string; avatar: string };
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
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
    ]
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
    comments: []
  }
];

const Timeline: React.FC<{ user: any }> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [postContent, setPostContent] = useState("");
  const [commentContent, setCommentContent] = useState<{ [key: number]: string }>({});

  // Đăng bài viết mới
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    const newPost: Post = {
      id: posts.length + 1,
      user: {
        name: user?.name || demoUser.name,
        avatar: user?.avatar || demoUser.avatar
      },
      content: postContent.trim(),
      createdAt: "Vừa xong",
      likes: 0,
      liked: false,
      comments: []
    };
    setPosts([newPost, ...posts]);
    setPostContent("");
  };

  // Gửi comment cho bài viết
  const handleCommentSubmit = (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    const content = commentContent[postId];
    if (!content?.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      user: {
        name: user?.name || demoUser.name,
        avatar: user?.avatar || demoUser.avatar
      },
      content,
      createdAt: "Vừa xong"
    };
    setPosts(
      posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
    setCommentContent({ ...commentContent, [postId]: "" });
  };

  // Like/Unlike
  const handleLike = (postId: number) => {
    setPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked
            }
          : post
      )
    );
  };

  return (
    <div className="max-w-lg mx-auto py-6 h-full flex flex-col animate-fade-in">
      {/* Đăng bài mới */}
      <Card className="mb-6 p-4">
        <form onSubmit={handlePostSubmit} className="flex gap-3 flex-col sm:flex-row items-start">
          <img src={user?.avatar || demoUser.avatar} alt={user?.name || demoUser.name} className="w-10 h-10 rounded-full object-cover" />
          <Textarea
            className="flex-1"
            placeholder="Bạn đang nghĩ gì?"
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
          />
          <Button
            type="submit"
            className="h-10 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 self-stretch sm:self-auto"
          >
            Đăng
          </Button>
        </form>
      </Card>

      {/* Danh sách bài viết */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {posts.map(post => (
          <Card key={post.id} className="p-4">
            <div className="flex gap-3 items-center mb-2">
              <img src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <div className="font-bold text-gray-800">{post.user.name}</div>
                <div className="text-xs text-gray-400">{post.createdAt}</div>
              </div>
            </div>
            <div className="text-base text-gray-800 mb-2 whitespace-pre-line">{post.content}</div>
            {/* Actions */}
            <div className="flex items-center gap-4 mb-2">
              <Button
                size="sm"
                variant={post.liked ? "secondary" : "ghost"}
                className={`transition-all ${post.liked ? "text-pink-500" : ""}`}
                onClick={() => handleLike(post.id)}
              >
                <Heart className={post.liked ? "fill-pink-500 text-pink-500" : ""} size={18} />
                <span>{post.likes > 0 ? post.likes : ""}</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-500"
              >
                <MessageCircle size={18} />
                <span> {post.comments.length} </span>
              </Button>
            </div>
            {/* Comment list */}
            <div className="space-y-2">
              {post.comments.map(cmt => (
                <div key={cmt.id} className="flex items-center gap-2 ml-4">
                  <img src={cmt.user.avatar} alt={cmt.user.name} className="w-7 h-7 rounded-full object-cover" />
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <span className="font-bold text-xs mr-2">{cmt.user.name}</span>
                    <span>{cmt.content}</span>
                  </div>
                  <span className="text-xs text-gray-400">{cmt.createdAt}</span>
                </div>
              ))}
            </div>
            {/* Comment input */}
            <form className="flex items-center gap-2 mt-2 ml-2" onSubmit={e => handleCommentSubmit(e, post.id)}>
              <Input
                className="h-8 text-sm"
                value={commentContent[post.id] || ""}
                placeholder="Viết bình luận..."
                onChange={e => setCommentContent({ ...commentContent, [post.id]: e.target.value })}
              />
              <Button type="submit" size="sm" variant="secondary" className="aspect-square h-8 w-8 p-0">
                <SendHorizonal size={16} />
              </Button>
            </form>
          </Card>
        ))}
        {posts.length === 0 && (
          <div className="text-center text-gray-400 pt-14">Chưa có bài viết nào.</div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
