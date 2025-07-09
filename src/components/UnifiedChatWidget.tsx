
import React, { useState } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2, Phone, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useChatContext } from '@/hooks/useChatContext';
import ProfileChatWindow from './ProfileChatWindow';

interface UnifiedChatWidgetProps {
  myUserId: string;
}

export default function UnifiedChatWidget({ myUserId }: UnifiedChatWidgetProps) {
  const [message, setMessage] = useState('');
  const { activeChatUser, isChatOpen, isFullScreen, closeChat, toggleFullScreen } = useChatContext();
  
  const { messages, isLoading, sendMessage, sending } = useRealTimeMessages(
    myUserId, 
    activeChatUser?.id || ''
  );

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !activeChatUser) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                Đang tải...
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
                    <p className="break-words leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_id === myUserId ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t bg-white border-gray-200">
          <div className="flex gap-2 items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 text-sm border-gray-300 focus:border-purple-500 rounded-full px-4 py-2 bg-gray-50 focus:bg-white transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full p-2 h-8 w-8 shadow-md hover:shadow-lg transition-all duration-200"
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
