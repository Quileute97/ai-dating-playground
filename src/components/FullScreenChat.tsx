import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, ImageIcon, Video } from "lucide-react";
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { uploadTimelineMedia } from '@/utils/uploadTimelineMedia';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FullScreenChatProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar: string;
  onBack: () => void;
}

export default function FullScreenChat({ 
  currentUserId, 
  targetUserId, 
  targetUserName, 
  targetUserAvatar, 
  onBack 
}: FullScreenChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, sendMessage, sending } = useRealTimeMessages(currentUserId, targetUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/${targetUserId}`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || sending || uploading) return;

    try {
      let mediaUrl = '';
      let mediaType = '';

      // Upload file if selected
      if (selectedFile) {
        setUploading(true);
        mediaUrl = await uploadTimelineMedia(selectedFile);
        mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      }

      // Send message with content and/or media
      await sendMessage(inputValue.trim() || 'Đã gửi file', mediaUrl, mediaType);
      setInputValue('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: "Vui lòng chọn file nhỏ hơn 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValidType) {
        toast({
          title: "Định dạng không hỗ trợ",
          description: "Chỉ hỗ trợ ảnh và video.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col bg-background animate-fade-in">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-card">
        <Button 
          variant="ghost" 
          size="lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack();
          }}
          className="mr-2 -ml-2 min-h-[48px] min-w-[48px] p-3 hover:bg-accent active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        
        <Avatar 
          className="w-10 h-10 mr-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleViewProfile}
        >
          <AvatarImage src={targetUserAvatar || '/placeholder.svg'} />
          <AvatarFallback>{targetUserName?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div 
          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleViewProfile}
        >
          <h3 className="font-semibold text-foreground">{targetUserName}</h3>
          <p className="text-sm text-muted-foreground">Nhấn để xem hồ sơ</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-muted-foreground">Đang tải tin nhắn...</div>
          </div>
        ) : Object.keys(messageGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="text-muted-foreground mb-2">Chưa có tin nhắn nào</div>
            <div className="text-sm text-muted-foreground">Hãy bắt đầu cuộc trò chuyện!</div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {date}
                  </div>
                </div>
                
                {/* Messages for this date */}
                {dateMessages.map((message, index) => {
                  const isMyMessage = message.sender_id === currentUserId;
                  const showAvatar = !isMyMessage && (
                    index === dateMessages.length - 1 || 
                    dateMessages[index + 1]?.sender_id !== message.sender_id
                  );

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 mb-2 ${
                        isMyMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isMyMessage && (
                        <Avatar className={`w-8 h-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                          <AvatarImage src={targetUserAvatar || '/placeholder.svg'} />
                          <AvatarFallback className="text-xs">
                            {targetUserName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                       <div
                         className={`max-w-[70%] p-3 rounded-2xl ${
                           isMyMessage
                             ? 'bg-primary text-primary-foreground rounded-br-md'
                             : 'bg-muted text-foreground rounded-bl-md'
                         }`}
                       >
                         {/* Media content */}
                         {message.media_url && (
                           <div className="mb-2">
                             {message.media_type === 'image' ? (
                               <img
                                 src={message.media_url}
                                 alt="Shared image"
                                 className="max-w-full h-auto rounded-lg cursor-pointer"
                                 onClick={() => window.open(message.media_url, '_blank')}
                               />
                             ) : message.media_type === 'video' ? (
                               <video
                                 src={message.media_url}
                                 controls
                                 className="max-w-full h-auto rounded-lg"
                               />
                             ) : null}
                           </div>
                         )}
                         
                         {/* Text content */}
                         {message.content && (
                           <p className="text-sm whitespace-pre-wrap break-words">
                             {message.content}
                           </p>
                         )}
                         
                         <p className={`text-xs mt-1 ${
                           isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                         }`}>
                           {formatTime(message.created_at)}
                         </p>
                       </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        {/* File preview */}
        {selectedFile && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              <span className="text-sm truncate">{selectedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Media upload buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending}
            title="Gửi ảnh"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1"
            disabled={sending || uploading}
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !selectedFile) || sending || uploading}
            size="icon"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}