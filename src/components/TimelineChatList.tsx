
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle, Users } from "lucide-react";
import { useTimelineMessaging } from "@/hooks/useTimelineMessaging";
import { Skeleton } from "@/components/ui/skeleton";
import TimelineChatModal from "./TimelineChatModal";
import { useFriendList } from "@/hooks/useFriends";

interface TimelineChatListProps {
  currentUserId: string;
}

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  user_profile?: {
    id: string;
    name: string;
    avatar: string;
  };
  friend_profile?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function TimelineChatList({ currentUserId }: TimelineChatListProps) {
  const [selectedChat, setSelectedChat] = useState<{
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
  } | null>(null);

  const { conversations, conversationsLoading } = useTimelineMessaging(currentUserId);
  const { data: friendsData } = useFriendList(currentUserId);

  const friends: Friend[] = friendsData || [];

  console.log('💬 Timeline conversations:', conversations);

  const openChat = (partnerId: string, partnerName: string, partnerAvatar: string) => {
    setSelectedChat({ partnerId, partnerName, partnerAvatar });
  };

  const closeChat = () => {
    setSelectedChat(null);
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col gap-2 w-[300px] max-w-xs min-w-[240px] pt-6 pr-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-700 text-base">Tin nhắn Timeline</h3>
        </div>

        <div className="flex flex-col gap-2">
          {conversationsLoading && Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))}

          {conversations && conversations.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Chưa có cuộc trò chuyện nào</p>
              <p className="text-xs text-gray-400 mt-1">
                Bắt đầu trò chuyện với bạn bè!
              </p>
            </div>
          )}

          {conversations?.map((conversation) => (
            <Card
              key={conversation.user_id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => openChat(
                conversation.user_id,
                conversation.user_name,
                conversation.user_avatar
              )}
            >
              <div className="relative">
                <img
                  src={conversation.user_avatar}
                  alt={conversation.user_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread_count}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {conversation.user_name}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.last_message}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(conversation.last_message_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </Card>
          ))}

          {/* Show friends who can be messaged */}
          {friends && friends.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Bạn bè</p>
              {friends.slice(0, 5).map((friend) => {
                const friendId = friend.user_id === currentUserId ? friend.friend_id : friend.user_id;
                const friendProfile = friend.user_id === currentUserId 
                  ? (friend as any).friend_profile 
                  : (friend as any).user_profile;
                
                return (
                  <Card
                    key={friendId}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer transition-colors mb-1"
                    onClick={() => openChat(
                      friendId,
                      friendProfile?.name || "Bạn bè",
                      friendProfile?.avatar || "/placeholder.svg"
                    )}
                  >
                    <img
                      src={friendProfile?.avatar || "/placeholder.svg"}
                      alt={friendProfile?.name || "Bạn bè"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-700 truncate">
                      {friendProfile?.name || "Bạn bè"}
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Chat Modal */}
      <TimelineChatModal
        isOpen={!!selectedChat}
        onClose={closeChat}
        partnerId={selectedChat?.partnerId || null}
        partnerName={selectedChat?.partnerName || ""}
        partnerAvatar={selectedChat?.partnerAvatar || ""}
        currentUserId={currentUserId}
      />
    </>
  );
}
