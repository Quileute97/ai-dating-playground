import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useActiveFriendsWithPresence } from '@/hooks/useActiveFriendsWithPresence';
import { useChatIntegration } from '@/hooks/useChatIntegration';

interface MessagesTabProps {
  userId: string;
}

export default function MessagesTab({ userId }: MessagesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, isLoading } = useActiveFriendsWithPresence(userId);
  const { startChatWith } = useChatIntegration();

  const handleStartChat = (friend: any) => {
    startChatWith({
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar
    });
  };

  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Tin nhắn</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="text-center text-gray-500 text-sm">
            Đang tải...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Tin nhắn</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Friends List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredFriends.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              {searchQuery ? 'Không tìm thấy bạn bè nào' : 'Chưa có bạn bè nào online'}
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div 
                key={friend.id} 
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => handleStartChat(friend)}
              >
                <div className="relative mr-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={friend.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{friend.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {friend.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {friend.name}
                    </h3>
                    <Badge variant={friend.online ? "default" : "secondary"} className="text-xs ml-2">
                      {friend.online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {friend.online ? "Đang hoạt động" : "Không hoạt động"}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}