import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChatIntegration } from '@/hooks/useChatIntegration';

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
  const [activeFriends, setActiveFriends] = useState<any[]>([]);
  const { data: friends } = useQuery({
    queryKey: ["friends", myId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .neq('id', myId)
        .limit(10);
      return data;
    }
  });
  const { startChatWith } = useChatIntegration();

  useEffect(() => {
    if (friends) {
      setActiveFriends(friends);
    }
  }, [friends]);

  const handleStartChat = (friend: any) => {
    startChatWith({
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar
    });
    // Still call the original callback for backward compatibility
    onChatUserChange?.(friend.id);
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600">Bạn bè đang online</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4 space-y-2">
        {activeFriends.map((friend) => (
          <div key={friend.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={friend.avatar || '/placeholder.svg'} />
                <AvatarFallback>{friend.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{friend.name}</p>
                <Badge variant="secondary">Đang online</Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleStartChat(friend)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
