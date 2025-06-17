
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTimelineMessaging } from "@/hooks/useTimelineMessaging";
import { Skeleton } from "@/components/ui/skeleton";
import TimelineChatModal from "./TimelineChatModal";

interface SimpleTimelineChatListProps {
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleTimelineChatList({ 
  currentUserId, 
  isOpen, 
  onClose 
}: SimpleTimelineChatListProps) {
  const [selectedChat, setSelectedChat] = useState<{
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
  } | null>(null);

  const { conversations, conversationsLoading } = useTimelineMessaging(currentUserId);

  const openChat = (partnerId: string, partnerName: string, partnerAvatar: string) => {
    setSelectedChat({ partnerId, partnerName, partnerAvatar });
  };

  const closeChat = () => {
    setSelectedChat(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Tin nhắn Timeline
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
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
          </div>
        </DialogContent>
      </Dialog>

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
