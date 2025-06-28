
import React, { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  myUserId: string;
  activeChatUser: ChatUser;
}

export default function ChatMessages({ messages, isLoading, myUserId, activeChatUser }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
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
  );
}
