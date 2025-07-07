
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Video, Settings, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';

interface FullScreenChatProps {
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar: string;
  currentUserId: string;
  onClose: () => void;
}

export default function FullScreenChat({ 
  targetUserId, 
  targetUserName, 
  targetUserAvatar, 
  currentUserId, 
  onClose 
}: FullScreenChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, sendMessage, sending } = useRealTimeMessages(
    currentUserId, 
    targetUserId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    try {
      await sendMessage(inputValue.trim());
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 flex flex-col z-50 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-purple-100/50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-purple-50 transition-colors duration-200 border-purple-200"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <img 
              src={targetUserAvatar || '/placeholder.svg'} 
              alt={targetUserName}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 text-lg">{targetUserName}</h2>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Đang online</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-blue-50 transition-colors duration-200"
            >
              <Video className="w-4 h-4 text-blue-600" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-purple-50 transition-colors duration-200"
            >
              <Settings className="w-4 h-4 text-purple-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center text-gray-500 mt-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Đang tải tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-white/90 mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-sm">
                <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-medium mb-2">Bắt đầu cuộc trò chuyện</p>
                <p className="text-sm text-white/80">Gửi tin nhắn đầu tiên cho {targetUserName}!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                  message.sender_id === currentUserId
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white/95 backdrop-blur-sm text-gray-800 border border-white/30 shadow-md hover:shadow-lg'
                }`}>
                  <p className="text-sm break-words leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender_id === currentUserId ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-white/95 backdrop-blur-md border-t border-purple-100/50 p-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border-purple-200 focus:border-purple-400 transition-all duration-200 rounded-2xl py-3 px-4 bg-white/80 backdrop-blur-sm"
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 rounded-2xl p-3 shadow-lg hover:shadow-xl"
            size="sm"
            disabled={!inputValue.trim() || sending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
