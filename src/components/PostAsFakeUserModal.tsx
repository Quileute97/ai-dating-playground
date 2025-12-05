
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, VideoIcon, X } from "lucide-react";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";

interface PostAsFakeUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  onPost: (content: string, mediaUrl?: string, mediaType?: string) => void;
}

const PostAsFakeUserModal = ({ isOpen, onClose, user, onPost }: PostAsFakeUserModalProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !selectedFile) {
      setError("Vui lòng nhập nội dung hoặc chọn ảnh/video");
      return;
    }
    
    setUploading(true);
    try {
      let mediaUrl = "";
      let mediaType = "";
      
      if (selectedFile) {
        mediaUrl = await uploadTimelineMedia(selectedFile);
        mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      }
      
      onPost(content.trim(), mediaUrl, mediaType);
      setContent("");
      setSelectedFile(null);
      setError("");
      onClose();
    } catch (err) {
      setError("Lỗi upload file. Vui lòng thử lại.");
    }
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("File quá lớn. Vui lòng chọn file dưới 10MB");
        return;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError("Chỉ hỗ trợ file ảnh và video");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // Reset content khi mở/đóng
  React.useEffect(() => {
    if (!isOpen) {
      setContent("");
      setSelectedFile(null);
      setError("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Đăng bài với tư cách <span className="text-pink-600">{user?.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nội dung bài viết..."
              rows={5}
            />
          </div>
          
          <div>
            <Label>Ảnh hoặc Video (tùy chọn)</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <VideoIcon className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={uploading}>Hủy</Button>
          <Button 
            onClick={handlePost} 
            disabled={(!content.trim() && !selectedFile) || uploading} 
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {uploading ? "Đang đăng..." : "Đăng"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostAsFakeUserModal;

