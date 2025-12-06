
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useActiveFriendsWithPresence } from '@/hooks/useActiveFriendsWithPresence';
import { useChatIntegration } from '@/hooks/useChatIntegration';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';

interface ActiveFriendsWithChatPanelProps {
  myId: string;
  selectedChatUserId?: string;
  onChatUserChange?: (userId: string | null) => void;
}

export default function ActiveFriendsWithChatPanel({
  myId,
  selectedChatUserId,
  onChatUserChange
}: ActiveFriendsWithChatPanelProps) {
  const { friends, isLoading } = useActiveFriendsWithPresence(myId);
  const { startChatWith } = useChatIntegration();

  const handleStartChat = (friend: any) => {
    startChatWith({
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar
    });
    // Still call the original callback for backward compatibility
    onChatUserChange?.(friend.id);
  };

  if (isLoading) {
    return (
      <div className="w-full lg:w-72 bg-white lg:border-l border-gray-200 flex flex-col">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-600">Bạn bè đang online</h2>
        </div>
        <Separator />
        <div className="flex-1 p-4">
          <div className="text-center text-gray-500 text-sm">
            Đang tải...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-72 bg-white lg:border-l border-gray-200 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600">Bạn bè đang online</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4 space-y-2">
        {friends.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Chưa có bạn bè nào online
          </div>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getDefaultAvatar(null, friend.avatar)} />
                    <AvatarFallback>{friend.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {friend.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{friend.name}</p>
                  <Badge variant={friend.online ? "default" : "secondary"} className="text-xs">
                    {friend.online ? "Đang online" : "Offline"}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleStartChat(friend)}
                className="h-8 w-8"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
