
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PostAsFakeUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  onPost: (content: string) => void;
}

const PostAsFakeUserModal = ({ isOpen, onClose, user, onPost }: PostAsFakeUserModalProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handlePost = () => {
    if (!content.trim()) {
      setError("Nội dung không được để trống");
      return;
    }
    onPost(content.trim());
    setContent("");
    setError("");
    onClose();
  };

  // Reset content khi mở/đóng
  React.useEffect(() => {
    if (!isOpen) setContent("");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Đăng bài với tư cách <span className="text-pink-600">{user?.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Nội dung bài viết..."
            rows={5}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handlePost} disabled={!content.trim()} className="bg-gradient-to-r from-purple-500 to-pink-500">Đăng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostAsFakeUserModal;

