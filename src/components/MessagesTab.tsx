import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useConversationsList } from '@/hooks/useConversationsList';
import FullScreenChat from './FullScreenChat';
import { format, isToday, isYesterday } from 'date-fns';

interface MessagesTabProps {
  userId: string;
}

export default function MessagesTab({ userId }: MessagesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
    userAvatar: string;
  } | null>(null);
  
  const { data: conversations, isLoading } = useConversationsList(userId);

  const handleOpenChat = (conversation: any) => {
    setSelectedChat({
      userId: conversation.other_user.id,
      userName: conversation.other_user.name,
      userAvatar: conversation.other_user.avatar
    });
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const filteredConversations = conversations?.filter(conv => 
    conv.other_user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatLastMessageTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Hôm qua';
    } else {
      return format(date, 'dd/MM');
    }
  };

  // Show fullscreen chat if a conversation is selected
  if (selectedChat) {
    return (
      <FullScreenChat
        currentUserId={userId}
        targetUserId={selectedChat.userId}
        targetUserName={selectedChat.userName}
        targetUserAvatar={selectedChat.userAvatar}
        onBack={handleBackToList}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Tin nhắn</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="text-center text-muted-foreground text-sm">
            Đang tải...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Tin nhắn</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có tin nhắn nào'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleOpenChat(conversation)}
              >
                <Avatar className="w-12 h-12 mr-3">
                  <AvatarImage src={conversation.other_user?.avatar || '/placeholder.svg'} />
                  <AvatarFallback>
                    {conversation.other_user?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium truncate">
                      {conversation.other_user?.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatLastMessageTime(conversation.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message || 'Chưa có tin nhắn'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}