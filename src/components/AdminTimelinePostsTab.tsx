import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MessageCircle, 
  Heart, 
  Image as ImageIcon, 
  Video as VideoIcon,
  MapPin,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimelinePost {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  location?: any;
  created_at: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  like_count: number;
  comment_count: number;
  is_fake_user: boolean;
}

const AdminTimelinePostsTab: React.FC = () => {
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<TimelinePost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'real' | 'fake'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes' | 'comments'>('newest');
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch real user posts with profile data
      const { data: realPosts, error: realError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_url,
          media_type,
          location,
          created_at,
          user_id,
          profiles!posts_user_id_fkey(name, avatar)
        `)
        .order('created_at', { ascending: false });

      if (realError) throw realError;

      // Fetch fake user posts with fake user data
      const { data: fakePosts, error: fakeError } = await supabase
        .from('fake_user_posts')
        .select(`
          id,
          content,
          media_url,
          media_type,
          location,
          created_at,
          fake_user_id,
          fake_users!fake_user_posts_fake_user_id_fkey(name, avatar)
        `)
        .order('created_at', { ascending: false });

      if (fakeError) throw fakeError;

      // Get like and comment counts for real posts
      const realPostIds = realPosts?.map(p => p.id) || [];
      const fakePostIds = fakePosts?.map(p => p.id) || [];

      let likeCounts: Record<string, number> = {};
      let commentCounts: Record<string, number> = {};

      if (realPostIds.length > 0) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .in('post_id', realPostIds);

        const { data: comments } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', realPostIds);

        likes?.forEach(like => {
          likeCounts[like.post_id] = (likeCounts[like.post_id] || 0) + 1;
        });

        comments?.forEach(comment => {
          commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1;
        });
      }

      // Format posts data
      const formattedRealPosts: TimelinePost[] = realPosts?.map(post => ({
        id: post.id,
        content: post.content || '',
        media_url: post.media_url,
        media_type: post.media_type,
        location: post.location,
        created_at: post.created_at,
        user_id: post.user_id,
        user_name: post.profiles?.name || 'Ẩn danh',
        user_avatar: post.profiles?.avatar,
        like_count: likeCounts[post.id] || 0,
        comment_count: commentCounts[post.id] || 0,
        is_fake_user: false
      })) || [];

      const formattedFakePosts: TimelinePost[] = fakePosts?.map(post => ({
        id: post.id,
        content: post.content || '',
        media_url: post.media_url,
        media_type: post.media_type,
        location: post.location,
        created_at: post.created_at,
        user_id: post.fake_user_id,
        user_name: post.fake_users?.name || 'Ẩn danh',
        user_avatar: post.fake_users?.avatar,
        like_count: 0, // Fake posts don't have likes for now
        comment_count: 0, // Fake posts don't have comments for now
        is_fake_user: true
      })) || [];

      const allPosts = [...formattedRealPosts, ...formattedFakePosts];
      setPosts(allPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Lỗi tải bài đăng',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEditPost = (post: TimelinePost) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSavePost = async () => {
    if (!editingPost) return;

    try {
      const tableName = editingPost.is_fake_user ? 'fake_user_posts' : 'posts';
      
      const { error } = await supabase
        .from(tableName)
        .update({ content: editContent })
        .eq('id', editingPost.id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật bài đăng',
      });

      setEditingPost(null);
      setEditContent('');
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Lỗi cập nhật',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (post: TimelinePost) => {
    try {
      const tableName = post.is_fake_user ? 'fake_user_posts' : 'posts';
      
      // Delete associated likes and comments first for real posts
      if (!post.is_fake_user) {
        await supabase.from('post_likes').delete().eq('post_id', post.id);
        await supabase.from('comments').delete().eq('post_id', post.id);
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã xóa bài đăng',
      });

      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Lỗi xóa bài đăng',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => {
      // Filter by search term
      const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by type
      const matchesType = filterType === 'all' || 
                         (filterType === 'real' && !post.is_fake_user) ||
                         (filterType === 'fake' && post.is_fake_user);

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'likes':
          return b.like_count - a.like_count;
        case 'comments':
          return b.comment_count - a.comment_count;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Quản lý bài đăng Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bài đăng hoặc tên người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Loại bài đăng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="real">Người dùng thật</SelectItem>
                <SelectItem value="fake">Người dùng ảo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="likes">Nhiều like</SelectItem>
                <SelectItem value="comments">Nhiều bình luận</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posts Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredAndSortedPosts.length} trong tổng số {posts.length} bài đăng
            </p>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Đang tải bài đăng...</p>
            </div>
          ) : filteredAndSortedPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy bài đăng nào
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedPosts.map((post) => (
                <Card key={post.id} className="relative">
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.user_avatar || 'https://source.unsplash.com/random/40x40?face'}
                          alt={post.user_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{post.user_name}</h3>
                            <Badge variant={post.is_fake_user ? 'secondary' : 'default'}>
                              {post.is_fake_user ? 'User ảo' : 'User thật'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePost(post)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Post Content */}
                    {editingPost?.id === post.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px]"
                          placeholder="Nội dung bài đăng..."
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSavePost} size="sm">
                            <Save className="w-4 h-4 mr-1" />
                            Lưu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPost(null);
                              setEditContent('');
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                        </div>

                        {/* Media */}
                        {post.media_url && (
                          <div className="mb-3">
                            {post.media_type === 'image' ? (
                              <img
                                src={post.media_url}
                                alt="Media"
                                className="max-w-full h-auto rounded-lg max-h-96 object-cover"
                              />
                            ) : post.media_type === 'video' ? (
                              <video
                                src={post.media_url}
                                controls
                                className="max-w-full h-auto rounded-lg max-h-96"
                              />
                            ) : null}
                          </div>
                        )}

                        {/* Location */}
                        {post.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                            <MapPin className="w-3 h-3" />
                            {post.location.formatted || 'Vị trí'}
                          </div>
                        )}

                        {/* Post Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.like_count} lượt thích
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comment_count} bình luận
                          </div>
                          {post.media_url && (
                            <div className="flex items-center gap-1">
                              {post.media_type === 'image' ? (
                                <ImageIcon className="w-4 h-4" />
                              ) : (
                                <VideoIcon className="w-4 h-4" />
                              )}
                              {post.media_type}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTimelinePostsTab;