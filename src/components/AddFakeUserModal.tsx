import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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
  onAdd: (user: Omit<FakeUser, 'id'>) => void;
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

  // Khi danh sách prompt thay đổi (hoặc lần đầu render) đặt prompt đầu tiên làm mặc định
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      aiPrompt: aiPrompts.length > 0 ? aiPrompts[0].prompt : '',
      aiPromptId: aiPrompts.length > 0 ? aiPrompts[0].id : '',
    }));
  }, [aiPrompts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.bio || !formData.aiPromptId) return;

    // Lưu ý: Không truyền aiPrompt content vào DB, chỉ truyền aiPromptId
    onAdd({
      name: formData.name,
      avatar: formData.avatar,
      gender: formData.gender,
      age: formData.age,
      bio: formData.bio,
      aiPrompt: '',          // không cần giữ prompt text ở đây
      aiPromptId: formData.aiPromptId,
      isActive: formData.isActive
    });
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
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              Thêm user
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFakeUserModal;
