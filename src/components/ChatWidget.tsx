
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
      <Card className="w-80 bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <button 
            onClick={handleUserClick}
            className="flex items-center gap-2 min-w-0 hover:bg-white/10 rounded-lg p-2 transition-colors flex-1"
          >
            <img 
              src={userAvatar || '/placeholder.svg'} 
              className="w-8 h-8 rounded-full object-cover border-2 border-white/30" 
            />
            <div className="min-w-0 text-left">
              <div className="font-medium text-sm truncate hover:text-purple-100 transition-colors">{userName}</div>
              <div className="text-xs text-purple-100">Đang hoạt động</div>
            </div>
          </button>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1 h-auto rounded-full"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 h-auto rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-64 p-3 bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center text-gray-400 text-sm">Đang tải...</div>
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
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="break-words">{msg.content}</p>
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
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 text-sm border-gray-200 focus:border-purple-400 rounded-full px-4"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full p-2 h-8 w-8"
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
