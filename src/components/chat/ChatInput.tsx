
import React, { useState } from 'react';
import { Send, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadTimelineMedia } from '@/utils/uploadTimelineMedia';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  sending: boolean;
}

export default function ChatInput({ onSendMessage, sending }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim() || sending || uploadingMedia) return;
    
    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMediaUpload = async (file: File, type: 'image' | 'video') => {
    if (uploadingMedia) return;
    
    setUploadingMedia(true);
    try {
      const mediaUrl = await uploadTimelineMedia(file);
      const mediaMessage = `[${type === 'image' ? '🖼️ Ảnh' : '🎬 Video'}] ${mediaUrl}`;
      await onSendMessage(mediaMessage);
      toast({
        title: "Đã gửi thành công",
        description: `${type === 'image' ? 'Ảnh' : 'Video'} đã được gửi`,
      });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Lỗi upload",
        description: `Không thể upload ${type === 'image' ? 'ảnh' : 'video'}. Vui lòng thử lại.`,
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleMediaUpload(file, 'image');
    }
    event.target.value = '';
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleMediaUpload(file, 'video');
    }
    event.target.value = '';
  };

  return (
    <div className="p-3 border-t bg-white border-gray-200">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="text-sm border-gray-300 focus:border-purple-500 rounded-full px-4 py-2 bg-gray-50 focus:bg-white transition-colors"
            onKeyPress={handleKeyPress}
            disabled={sending || uploadingMedia}
          />
          
          {/* Media Upload Buttons */}
          <div className="flex gap-1 mt-2">
            {/* Image Upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageUpload}
                disabled={uploadingMedia || sending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-gray-300 hover:bg-purple-50 relative"
                disabled={uploadingMedia || sending}
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                Ảnh
              </Button>
            </div>
            
            {/* Video Upload */}
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleVideoUpload}
                disabled={uploadingMedia || sending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-gray-300 hover:bg-purple-50 relative"
                disabled={uploadingMedia || sending}
              >
                <VideoIcon className="w-3 h-3 mr-1" />
                Video
              </Button>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleSendMessage}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full p-2 h-8 w-8 shadow-md hover:shadow-lg transition-all duration-200"
          disabled={!message.trim() || sending || uploadingMedia}
        >
          {sending || uploadingMedia ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {uploadingMedia && (
        <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
          <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          Đang upload media...
        </div>
      )}
    </div>
  );
}
