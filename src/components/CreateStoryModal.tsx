import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, Video, X, Upload, Loader2 } from "lucide-react";
import { useStories } from "@/hooks/useStories";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";
import { useToast } from "@/hooks/use-toast";

interface CreateStoryModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ open, onClose, userId }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory, isCreating } = useStories(userId);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !userId) return;

    try {
      setUploading(true);

      // Upload to storage
      const mediaUrl = await uploadTimelineMedia(selectedFile);
      if (!mediaUrl) {
        throw new Error("Failed to upload media");
      }

      // Create story
      await createStory({
        media_url: mediaUrl,
        media_type: mediaType,
      });

      toast({
        title: "Story đã được đăng!",
        description: "Story của bạn sẽ hiển thị trong 24 giờ.",
      });

      // Reset and close
      setPreview(null);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng story. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo Story mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
            >
              <div className="flex justify-center gap-4 mb-4">
                <div className="p-3 bg-pink-100 rounded-full">
                  <Image className="w-6 h-6 text-pink-500" />
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Video className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-gray-600 font-medium">Chọn ảnh hoặc video</p>
              <p className="text-sm text-gray-400 mt-1">Nhấp để chọn file</p>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
              {mediaType === "video" ? (
                <video
                  src={preview}
                  className="w-full rounded-xl max-h-80 object-contain bg-black"
                  controls
                  muted
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-xl max-h-80 object-contain bg-gray-100"
                />
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={uploading || isCreating}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              onClick={handleSubmit}
              disabled={!preview || uploading || isCreating}
            >
              {uploading || isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Đăng Story
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;
