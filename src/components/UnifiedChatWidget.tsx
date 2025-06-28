
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2, Phone, Video, Image as ImageIcon, Video as VideoIcon, Paperclip } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useChatContext } from '@/hooks/useChatContext';
import { uploadTimelineMedia } from '@/utils/uploadTimelineMedia';
import { useToast } from '@/hooks/use-toast';
import ProfileChatWindow from './ProfileChatWindow';

interface UnifiedChatWidgetProps {
  myUserId: string;
}

export default function UnifiedChatWidget({ myUserId }: UnifiedChatWidgetProps) {
  const [message, setMessage] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { activeChatUser, isChatOpen, isFullScreen, closeChat, toggleFullScreen } = useChatContext();
  const { toast } = useToast();
  
  const { messages, isLoading, sendMessage, sending } = useRealTimeMessages(
    myUserId, 
    activeChatUser?.id || ''
  );

  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !activeChatUser) return;
    
    try {
      await sendMessage(message);
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
    if (!activeChatUser || uploadingMedia) return;
    
    setUploadingMedia(true);
    try {
      const mediaUrl = await uploadTimelineMedia(file);
      const mediaMessage = `[${type === 'image' ? '🖼️ Ảnh' : '🎬 Video'}] ${mediaUrl}`;
      await sendMessage(mediaMessage);
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
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleMediaUpload(file, 'video');
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (content: string) => {
    // Check if message contains media
    const mediaPattern = /\[(🖼️ Ảnh|🎬 Video)\] (https?:\/\/[^\s]+)/;
    const match = content.match(mediaPattern);
    
    if (match) {
      const [, mediaType, mediaUrl] = match;
      const isImage = mediaType === '🖼️ Ảnh';
      
      return (
        <div className="space-y-2">
          {isImage ? (
            <img 
              src={mediaUrl} 
              alt="Shared image" 
              className="max-w-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(mediaUrl, '_blank')}
            />
          ) : (
            <video 
              src={mediaUrl} 
              controls 
              className="max-w-48 rounded-lg"
            />
          )}
        </div>
      );
    }
    
    return <p className="break-words leading-relaxed">{content}</p>;
  };

  if (!isChatOpen || !activeChatUser) return null;

  // Full screen mode - use ProfileChatWindow
  if (isFullScreen) {
    return (
      <ProfileChatWindow
        targetUserId={activeChatUser.id}
        targetUserName={activeChatUser.name}
        targetUserAvatar={activeChatUser.avatar}
        currentUserId={myUserId}
        onClose={() => toggleFullScreen()}
      />
    );
  }

  // Small widget mode
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <img 
                src={activeChatUser.avatar || '/placeholder.svg'} 
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" 
                alt={activeChatUser.name}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate text-gray-900">{activeChatUser.name}</div>
              <div className="text-xs text-green-600 font-medium">Đang hoạt động</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullScreen}
              className="text-gray-500 hover:bg-gray-100 p-1 h-auto rounded-full"
              title="Mở rộng toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChat}
              className="text-gray-500 hover:bg-gray-100 p-1 h-auto rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-64 p-3 bg-gradient-to-b from-gray-50 to-white">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center text-gray-400 text-sm py-4 flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                Đang tải tin nhắn...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-purple-500" />
                </div>
                <p className="font-medium mb-1">Bắt đầu cuộc trò chuyện!</p>
                <p className="text-xs text-gray-400">Gửi tin nhắn đầu tiên cho {activeChatUser.name}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === myUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] ${
                    msg.sender_id === myUserId
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    {renderMessage(msg.content)}
                    <p className={`text-xs mt-1 ${
                      msg.sender_id === myUserId ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
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
      </Card>
    </div>
  );
}
