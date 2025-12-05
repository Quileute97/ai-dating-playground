
import React, { useState } from 'react';
import { X, MessageCircle, Send, Minimize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useNavigate } from 'react-router-dom';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar: string;
  myUserId: string;
}

export default function ChatWidget({
  isOpen,
  onClose,
  userId,
  userName,
  userAvatar,
  myUserId
}: ChatWidgetProps) {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  
  const { messages, isLoading, sendMessage, sending } = useRealTimeMessages(myUserId, userId);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUserClick = () => {
    navigate(`/profile/${userId}`);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden">
        {/* Header - Facebook style */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
          <button 
            onClick={handleUserClick}
            className="flex items-center gap-3 min-w-0 hover:bg-gray-50 rounded-lg p-2 transition-colors flex-1 -ml-2"
          >
            <img 
              src={userAvatar || '/placeholder.svg'} 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <div className="min-w-0 text-left">
              <div className="font-medium text-sm truncate hover:text-blue-600 transition-colors text-gray-900">{userName}</div>
              <div className="text-xs text-green-600 font-medium">Đang hoạt động</div>
            </div>
          </button>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:bg-gray-100 p-1 h-auto rounded-full"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-100 p-1 h-auto rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <>
            {/* Messages - Facebook style */}
            <ScrollArea className="h-64 p-3 bg-gray-50">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center text-gray-400 text-sm py-4">Đang tải...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Bắt đầu cuộc trò chuyện!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === myUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        msg.sender_id === myUserId
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}>
                        {/* Display image if media_url exists and is image */}
                        {msg.media_url && msg.media_type?.startsWith('image') && (
                          <div className="mb-2">
                            <img 
                              src={msg.media_url} 
                              alt="Shared image" 
                              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.media_url, '_blank')}
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                        )}
                        
                        {/* Display video if media_url exists and is video */}
                        {msg.media_url && msg.media_type?.startsWith('video') && (
                          <div className="mb-2">
                            <video 
                              src={msg.media_url} 
                              controls 
                              className="max-w-full h-auto rounded-lg"
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                        )}
                        
                        {/* Handle legacy image messages in content */}
                        {!msg.media_url && msg.content?.includes('https://') && msg.content?.includes('[🖼️ Ảnh]') && (
                          <div className="mb-2">
                            <img 
                              src={msg.content.split('] ')[1]} 
                              alt="Shared image" 
                              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.content.split('] ')[1], '_blank')}
                              style={{ maxHeight: '150px' }}
                            />
                            <p className="text-xs mt-1 break-words">{msg.content.split('] ')[0]}]</p>
                          </div>
                        )}
                        
                        {/* Display regular text content */}
                        {msg.content && (!msg.content.includes('[🖼️ Ảnh]') || msg.media_url) && (
                          <p className="break-words">{msg.content}</p>
                        )}
                        
                        <p className={`text-xs mt-1 ${
                          msg.sender_id === myUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input - Facebook style */}
            <div className="p-3 border-t bg-white border-gray-200">
              <div className="flex gap-2 items-center">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Aa"
                  className="flex-1 text-sm border-gray-300 focus:border-blue-500 rounded-full px-4 py-2 bg-gray-100 border-0 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 h-8 w-8 shadow-none"
                  disabled={!message.trim() || sending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
