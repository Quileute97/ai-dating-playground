import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { format } from 'date-fns';

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
  const { messages, isLoading, sendMessage, sending } = useRealTimeMessages(currentUserId, targetUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    try {
      await sendMessage(inputValue);
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
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-card">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={targetUserAvatar || '/placeholder.svg'} />
          <AvatarFallback>{targetUserName?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{targetUserName}</h3>
          <p className="text-sm text-muted-foreground">Đang hoạt động</p>
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
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
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
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1"
            disabled={sending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}