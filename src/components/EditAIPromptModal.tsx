
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AIPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
}
interface EditAIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AIPrompt) => void;
  prompt: AIPrompt | null;
}
const EditAIPromptModal = ({ isOpen, onClose, onSave, prompt }: EditAIPromptModalProps) => {
  const [form, setForm] = useState<AIPrompt | null>(prompt);
  const categories = ['Romance', 'Lifestyle', 'Friendship', 'Entertainment', 'Professional'];

  useEffect(() => {
    setForm(prompt);
  }, [prompt]);

  if (!form) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa AI Prompt</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
            onClose();
          }}
        >
          <div>
            <Label>Tên prompt</Label>
            <Input value={form.name} onChange={e => setForm(f => f && ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <Label>Danh mục</Label>
            <Select value={form.category} onValueChange={val => setForm(f => f && ({ ...f, category: val }))}>
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
            <Label>Mô tả</Label>
            <Textarea value={form.description} onChange={e => setForm(f => f && ({ ...f, description: e.target.value }))} required />
          </div>
          <div>
            <Label>Nội dung prompt</Label>
            <Textarea value={form.prompt} onChange={e => setForm(f => f && ({ ...f, prompt: e.target.value }))} minLength={10} required />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default EditAIPromptModal;
