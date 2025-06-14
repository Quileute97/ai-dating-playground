
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
}

interface AddAIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (prompt: Omit<AIPrompt, 'id'>) => void;
}

const AddAIPromptModal = ({ isOpen, onClose, onAdd }: AddAIPromptModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    category: 'Romance'
  });

  const categories = ['Romance', 'Lifestyle', 'Friendship', 'Entertainment', 'Professional'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.prompt) return;

    onAdd(formData);
    setFormData({
      name: '',
      description: '',
      prompt: '',
      category: 'Romance'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm AI Prompt mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="promptName">Tên prompt</Label>
            <Input
              id="promptName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ví dụ: Người yêu ghen tuông"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Danh mục</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn gọn về prompt này..."
              required
            />
          </div>

          <div>
            <Label htmlFor="promptContent">Nội dung prompt</Label>
            <Textarea
              id="promptContent"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Hãy trả lời như một người yêu hay ghen tuông, quan tâm đến từng hành động của đối phương..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
              Thêm prompt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAIPromptModal;
