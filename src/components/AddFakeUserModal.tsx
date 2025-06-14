
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";

interface FakeUser {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  bio: string;
  aiPrompt: string;      // cũ, dùng cho UI, không lưu vào DB nữa
  aiPromptId?: string;   // thêm trường này cho form, dùng để lưu DB
  isActive: boolean;
}

interface AIPrompt {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  category?: string;
}

interface AddFakeUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Omit<FakeUser, 'id'> & { aiPromptId: string }) => void;
  aiPrompts: AIPrompt[];
}

const AddFakeUserModal = ({ isOpen, onClose, onAdd, aiPrompts }: AddFakeUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    avatar: '/placeholder.svg',
    gender: 'female' as 'male' | 'female',
    age: 20,
    bio: '',
    aiPrompt: aiPrompts.length > 0 ? aiPrompts[0].prompt : '',
    aiPromptId: aiPrompts.length > 0 ? aiPrompts[0].id : '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Khi danh sách prompt thay đổi đặt prompt đầu tiên làm mặc định
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      aiPrompt: aiPrompts.length > 0 ? aiPrompts[0].prompt : '',
      aiPromptId: aiPrompts.length > 0 ? aiPrompts[0].id : '',
    }));
  }, [aiPrompts]);

  // Xử lý upload ảnh đại diện
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadTimelineMedia(file);
      setFormData(prev => ({
        ...prev,
        avatar: url
      }));
    } catch (error: any) {
      alert('Upload ảnh thất bại: ' + error.message);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.bio ||
      !formData.aiPromptId ||
      !formData.gender ||
      !formData.age ||
      !formData.avatar
    ) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    setLoading(true);

    // Log debug chi tiết:
    console.log('== Fake user SUBMIT ==', {
      name: formData.name,
      avatar: formData.avatar,
      gender: formData.gender,
      age: formData.age,
      bio: formData.bio,
      aiPromptId: formData.aiPromptId,
      isActive: formData.isActive,
    });

    // Gọi onAdd với đúng prop
    await onAdd({
      name: formData.name,
      avatar: formData.avatar,
      gender: formData.gender,
      age: formData.age,
      bio: formData.bio,
      aiPrompt: '', // không cần giữ prompt text ở đây nữa
      aiPromptId: formData.aiPromptId!,
      isActive: formData.isActive
    });

    setLoading(false);
    // reset form và đóng modal
    setFormData({
      name: '',
      avatar: '/placeholder.svg',
      gender: 'female',
      age: 20,
      bio: '',
      aiPrompt: aiPrompts.length > 0 ? aiPrompts[0].prompt : '',
      aiPromptId: aiPrompts.length > 0 ? aiPrompts[0].id : '',
      isActive: true
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm người dùng ảo mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên..."
              required
            />
          </div>

          {/* Upload avatar */}
          <div className="space-y-2">
            <Label htmlFor="avatar">Ảnh đại diện</Label>
            <div className="flex items-center gap-4">
              <img
                src={formData.avatar || '/placeholder.svg'}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="w-full"
                onChange={handleAvatarUpload}
                disabled={uploading || loading}
              />
            </div>
            {uploading && (
              <div className="text-xs text-blue-600">Đang upload ảnh...</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="male">Nam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="age">Tuổi</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="65"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Tiểu sử</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Mô tả về người này..."
              required
            />
          </div>
          <div>
            <Label htmlFor="prompt">AI Prompt</Label>
            <Select
              value={formData.aiPromptId}
              onValueChange={(id: string) => {
                const promptObj = aiPrompts.find(p => p.id === id);
                setFormData(prev => ({
                  ...prev,
                  aiPromptId: id,
                  aiPrompt: promptObj?.prompt ?? ''
                }));
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn AI prompt..." />
              </SelectTrigger>
              <SelectContent>
                {aiPrompts.map(prompt => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    <span className="font-medium">{prompt.name}</span>
                    <span className="block text-xs text-gray-500">{prompt.description?.slice(0, 50)}...</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="active">Kích hoạt ngay</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500" disabled={loading || uploading}>
              {loading ? 'Đang thêm...' : 'Thêm user'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFakeUserModal;
