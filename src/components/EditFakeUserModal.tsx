
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FakeUser {
  id: string;
  name: string;
  avatar: string;
  gender: "male" | "female";
  age: number;
  bio: string;
  aiPrompt: string;
  isActive: boolean;
}
interface EditFakeUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FakeUser) => void;
  user: FakeUser | null;
}
const EditFakeUserModal = ({ isOpen, onClose, onSave, user }: EditFakeUserModalProps) => {
  const [form, setForm] = useState<FakeUser | null>(user);

  useEffect(() => {
    setForm(user);
  }, [user]);

  if (!form) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng ảo</DialogTitle>
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
            <Label>Tên</Label>
            <Input value={form.name} onChange={e => setForm(f => f && { ...f, name: e.target.value })} required />
          </div>
          <div>
            <Label>Ảnh đại diện (URL)</Label>
            <Input value={form.avatar} onChange={e => setForm(f => f && { ...f, avatar: e.target.value })} />
          </div>
          <div>
            <Label>Giới tính</Label>
            <Select value={form.gender} onValueChange={val => setForm(f => f && { ...f, gender: val as "male" | "female" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tuổi</Label>
            <Input type="number" value={form.age} onChange={e => setForm(f => f && { ...f, age: Number(e.target.value) })} required />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm(f => f && { ...f, bio: e.target.value })} />
          </div>
          <div>
            <Label>AI Prompt</Label>
            <Textarea value={form.aiPrompt} onChange={e => setForm(f => f && { ...f, aiPrompt: e.target.value })} minLength={10} />
          </div>
          <div>
            <Label>Trạng thái</Label>
            <Select value={form.isActive ? "active" : "inactive"} onValueChange={v => setForm(f => f && { ...f, isActive: v === "active" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFakeUserModal;
