import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminUserPostModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onPostCreated: () => void;
}

const AdminUserPostModal: React.FC<AdminUserPostModalProps> = ({
  isOpen,
  user,
  onClose,
  onPostCreated
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [locationName, setLocationName] = useState('');
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Vui lòng nhập nội dung",
        variant: "destructive"
      });
      return;
    }

    setPosting(true);
    
    // Create post in fake_user_posts table
    const postData = {
      fake_user_id: user.id,
      content: content.trim(),
      media_url: mediaUrl || null,
      media_type: mediaType || null,
      location: locationName ? { name: locationName } : null
    };

    const { error } = await supabase
      .from('fake_user_posts')
      .insert(postData);

    if (error) {
      toast({
        title: "Lỗi đăng bài",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Thành công",
        description: `Đã đăng bài với tư cách ${user.name}`,
      });
      setContent('');
      setMediaUrl('');
      setMediaType('');
      setLocationName('');
      onPostCreated();
      onClose();
    }
    
    setPosting(false);
  };

  const detectMediaType = (url: string) => {
    if (!url) return '';
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
    
    const lowercaseUrl = url.toLowerCase();
    
    if (imageExtensions.some(ext => lowercaseUrl.includes(ext))) {
      return 'image';
    } else if (videoExtensions.some(ext => lowercaseUrl.includes(ext))) {
      return 'video';
    }
    return '';
  };

  const handleMediaUrlChange = (url: string) => {
    setMediaUrl(url);
    setMediaType(detectMediaType(url));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Đăng bài với tư cách {user.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user.avatar || '/placeholder.svg'}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">
                {user.gender === 'female' ? '♀' : '♂'} {user.age} tuổi
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Nội dung bài viết</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="mediaUrl">URL Hình ảnh/Video (tùy chọn)</Label>
            <Input
              id="mediaUrl"
              value={mediaUrl}
              onChange={(e) => handleMediaUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {mediaType && (
              <p className="text-sm text-gray-500 mt-1">
                Loại media: {mediaType === 'image' ? 'Hình ảnh' : 'Video'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Địa điểm (tùy chọn)</Label>
            <Input
              id="location"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Hà Nội, Việt Nam"
            />
          </div>

          {/* Preview */}
          {(content || mediaUrl) && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium mb-2">Xem trước:</p>
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={user.avatar || '/placeholder.svg'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    {locationName && (
                      <p className="text-xs text-gray-500">📍 {locationName}</p>
                    )}
                  </div>
                </div>
                {content && <p className="text-sm mb-2">{content}</p>}
                {mediaUrl && (
                  <div className="mt-2">
                    {mediaType === 'image' ? (
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="max-w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
                        <p className="text-gray-500">Video preview</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              disabled={posting}
            >
              {posting ? 'Đang đăng...' : 'Đăng bài'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserPostModal;