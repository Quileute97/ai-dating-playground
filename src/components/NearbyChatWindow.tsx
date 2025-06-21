
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useNearbyConversation } from '@/hooks/useNearbyConversation';
import { useNavigate } from 'react-router-dom';

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

interface NearbyChatWindowProps {
  user: NearbyUser;
  currentUserId: string | null;
  onClose: () => void;
}

const NearbyChatWindow = ({ user, currentUserId, onClose }: NearbyChatWindowProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { messages, sendMessage, loading } = useNearbyConversation(currentUserId, user.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleUserClick = () => {
    navigate(`/profile/${user.id}`);
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: "Tính năng video call sẽ được triển khai trong phiên bản tiếp theo!",
    });
  };

  const handleVoiceCall = () => {
    toast({
      title: "Voice Call", 
      description: "Tính năng gọi thoại sẽ được triển khai trong phiên bản tiếp theo!",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="rounded-full p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <button 
            onClick={handleUserClick}
            className="flex items-center gap-3 hover:bg-purple-50 rounded-lg p-2 transition-colors flex-1"
          >
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
            />
            
            <div className="flex-1 text-left">
              <h2 className="font-semibold text-gray-800 hover:text-purple-600 transition-colors">{user.name}, {user.age}</h2>
              <div className="flex items-center gap-1">
                {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                <span className="text-xs text-gray-500">
                  {user.isOnline ? 'Đang online' : user.lastSeen}
                </span>
              </div>
            </div>
          </button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleVoiceCall}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleVideoCall}>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Bắt đầu cuộc trò chuyện với {user.name}!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-200 ${
                  message.sender === currentUserId
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-purple-100 shadow-md'
                }`}>
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === currentUserId ? 'text-purple-100' : 'text-gray-500'
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
      <div className="bg-white/90 backdrop-blur-sm border-t border-purple-100 p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border-purple-200 focus:border-purple-400 transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            size="sm"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NearbyChatWindow;
