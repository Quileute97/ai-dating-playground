
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
  aiPrompt: string;
  isActive: boolean;
}

interface AddFakeUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Omit<FakeUser, 'id'>) => void;
}

const AddFakeUserModal = ({ isOpen, onClose, onAdd }: AddFakeUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    avatar: '/placeholder.svg',
    gender: 'female' as 'male' | 'female',
    age: 20,
    bio: '',
    aiPrompt: '',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.bio || !formData.aiPrompt) return;

    onAdd(formData);
    setFormData({
      name: '',
      avatar: '/placeholder.svg',
      gender: 'female',
      age: 20,
      bio: '',
      aiPrompt: '',
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
            <Textarea
              id="prompt"
              value={formData.aiPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
              placeholder="Hướng dẫn cách AI trả lời khi chat..."
              required
            />
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
