import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminUserAlbumModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onAlbumUpdated: () => void;
}

const AdminUserAlbumModal: React.FC<AdminUserAlbumModalProps> = ({
  isOpen,
  user,
  onClose,
  onAlbumUpdated
}) => {
  const [album, setAlbum] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.album) {
      setAlbum(Array.isArray(user.album) ? user.album : []);
    }
  }, [user]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Vui lòng nhập URL hình ảnh",
        variant: "destructive"
      });
      return;
    }

    setAlbum(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setAlbum(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from('fake_users')
      .update({ album })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Lỗi cập nhật album",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Thành công",
        description: "Đã cập nhật album",
      });
      onAlbumUpdated();
      onClose();
    }
    
    setSaving(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Quản lý Album - {user.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Avatar */}
          <div>
            <Label>Ảnh đại diện hiện tại</Label>
            <div className="mt-2">
              <img
                src={user.avatar || '/placeholder.svg'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Add New Image */}
          <div>
            <Label htmlFor="newImage">Thêm hình ảnh mới</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="newImage"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
              />
              <Button onClick={handleAddImage} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Album Grid */}
          <div>
            <Label>Album ({album.length} ảnh)</Label>
            <div className="mt-2">
              {album.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  Chưa có ảnh nào trong album
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {album.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Album ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {album.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium mb-2">Xem trước profile:</p>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center space-x-3 mb-3">
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
                <div className="grid grid-cols-4 gap-2">
                  {album.slice(0, 4).map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
                {album.length > 4 && (
                  <p className="text-xs text-gray-500 mt-2">
                    +{album.length - 4} ảnh khác
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu Album'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserAlbumModal;