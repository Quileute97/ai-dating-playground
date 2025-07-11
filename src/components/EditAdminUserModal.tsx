import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface EditAdminUserModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onUpdate: (userData: any) => void;
  aiPrompts: any[];
}

const EditAdminUserModal: React.FC<EditAdminUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdate,
  aiPrompts
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    avatar: '',
    gender: 'female',
    age: 25,
    bio: '',
    location_name: '',
    lat: null,
    lng: null,
    interests: [],
    height: 165,
    job: '',
    education: '',
    is_dating_active: true,
    is_active: true,
    ai_prompt_id: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || '',
        name: user.name || '',
        avatar: user.avatar || '',
        gender: user.gender || 'female',
        age: user.age || 25,
        bio: user.bio || '',
        location_name: user.location_name || '',
        lat: user.lat,
        lng: user.lng,
        interests: user.interests || [],
        height: user.height || 165,
        job: user.job || '',
        education: user.education || '',
        is_dating_active: user.is_dating_active ?? true,
        is_active: user.is_active ?? true,
        ai_prompt_id: user.ai_prompt_id || ''
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const popularInterests = [
    'Du lịch', 'Ẩm thực', 'Âm nhạc', 'Phim ảnh', 'Thể thao', 'Đọc sách',
    'Nấu ăn', 'Nhiếp ảnh', 'Yoga', 'Gym', 'Shopping', 'Game'
  ];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Admin User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="age">Tuổi</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="80"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="avatar">URL Ảnh đại diện</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Giới tính</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
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
              <Label htmlFor="height">Chiều cao (cm)</Label>
              <Input
                id="height"
                type="number"
                min="140"
                max="220"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Giới thiệu bản thân</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job">Nghề nghiệp</Label>
              <Input
                id="job"
                value={formData.job}
                onChange={(e) => setFormData(prev => ({ ...prev, job: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="education">Học vấn</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Địa điểm</Label>
            <Input
              id="location"
              value={formData.location_name}
              onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
              placeholder="Hà Nội, Việt Nam"
            />
          </div>

          <div>
            <Label>Sở thích</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {popularInterests.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={() => toggleInterest(interest)}
                  />
                  <label htmlFor={interest} className="text-sm">{interest}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>AI Prompt</Label>
            <Select value={formData.ai_prompt_id} onValueChange={(value) => setFormData(prev => ({ ...prev, ai_prompt_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn AI prompt..." />
              </SelectTrigger>
              <SelectContent>
                {aiPrompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    {prompt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked as boolean }))}
              />
              <Label htmlFor="is_active">Hoạt động</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_dating_active"
                checked={formData.is_dating_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_dating_active: checked as boolean }))}
              />
              <Label htmlFor="is_dating_active">Hiển thị trong hẹn hò</Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              Cập nhật
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdminUserModal;