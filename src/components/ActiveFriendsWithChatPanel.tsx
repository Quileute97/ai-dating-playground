
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Minimize2, Maximize2 } from "lucide-react";
import { useActiveFriendsWithPresence } from "@/hooks/useActiveFriendsWithPresence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Now the component requires a myId prop for current user id
interface ActiveFriendsWithChatPanelProps {
  myId: string;
}

export default function ActiveFriendsWithChatPanel({ myId }: ActiveFriendsWithChatPanelProps) {
  if (!myId) throw new Error("Missing myId prop in ActiveFriendsWithChatPanel");

  const { friends, isLoading } = useActiveFriendsWithPresence(myId);

  // Chọn mặc định bạn bè đầu tiên (nếu có)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  React.useEffect(() => {
    if (!selectedFriend && friends && friends.length > 0) {
      setSelectedFriend(friends[0].id);
    }
  }, [selectedFriend, friends]);

  const selectedFriendData = friends.find(f => f.id === selectedFriend);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    // TODO: Implement actual message sending
    console.log("Sending message:", chatMessage, "to:", selectedFriend);
    setChatMessage("");
  };

  return (
    <aside className="hidden lg:flex flex-col w-[300px] max-w-xs min-w-[240px] pt-6 pr-4 h-full">
      {/* Friends List */}
      <div className="flex-shrink-0">
        <h3 className="font-bold text-gray-700 text-base pb-2">Bạn bè đang hoạt động</h3>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {isLoading && (
            <div className="text-gray-400 py-4 text-center">Đang tải...</div>
          )}
          {!isLoading && friends.length === 0 && (
            <div className="text-gray-400 py-4 text-center">Bạn chưa có bạn bè nào.</div>
          )}
          {
            friends.map(friend => (
              <button
                key={friend.id}
                className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors
                ${selectedFriend === friend.id ? "bg-purple-100" : "hover:bg-gray-100"}
                `}
                onClick={() => setSelectedFriend(friend.id)}
              >
                <img src={friend.avatar || '/placeholder.svg'} className={`w-8 h-8 rounded-full object-cover border-2 ${friend.online ? "border-green-400" : "border-gray-300"}`} />
                <span className="text-sm font-medium truncate">{friend.name}</span>
                <span className={`ml-auto block w-2 h-2 rounded-full flex-shrink-0 ${friend.online ? "bg-green-500" : "bg-gray-300"}`}></span>
              </button>
            ))
          }
        </div>
      </div>

      {/* Compact Chat Window - Fixed at bottom */}
      <div className="mt-4 flex-1 flex flex-col justify-end">
        {selectedFriend && selectedFriendData && (
          <Card className="bg-white border shadow-lg rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={selectedFriendData.avatar || '/placeholder.svg'} 
                  className="w-6 h-6 rounded-full object-cover border border-white/30 flex-shrink-0" 
                />
                <span className="text-sm font-medium truncate">{selectedFriendData.name}</span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedFriendData.online ? "bg-green-400" : "bg-gray-300"}`}></span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                {isChatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Chat Content - Collapsible */}
            {!isChatMinimized && (
              <>
                {/* Messages Area */}
                <ScrollArea className="h-48 p-3 bg-gray-50">
                  <div className="space-y-2">
                    {/* Demo messages */}
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-2xl max-w-[80%] text-sm">
                        Chào bạn! 👋
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white border px-3 py-2 rounded-2xl max-w-[80%] text-sm text-gray-800">
                        Hello! Bạn khỏe không? 😊
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-400 py-2">
                      Hôm nay
                    </div>
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 text-sm border-gray-200 focus:border-purple-400 rounded-full"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full p-2 h-auto"
                      disabled={!chatMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </aside>
  );
}
