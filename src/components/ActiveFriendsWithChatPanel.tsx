
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Minimize2, Maximize2 } from "lucide-react";
import { useActiveFriendsWithPresence } from "@/hooks/useActiveFriendsWithPresence";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActiveFriendsWithChatPanelProps {
  myId: string;
  selectedChatUserId?: string; // Thêm prop để nhận user được chọn từ bên ngoài
  onChatUserChange?: (userId: string | null) => void; // Callback khi user chat thay đổi
}

export default function ActiveFriendsWithChatPanel({ 
  myId, 
  selectedChatUserId, 
  onChatUserChange 
}: ActiveFriendsWithChatPanelProps) {
  if (!myId) throw new Error("Missing myId prop in ActiveFriendsWithChatPanel");

  const { friends, isLoading } = useActiveFriendsWithPresence(myId);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [chatMessage, setChatMessage] = useState("");

  // Sử dụng real-time messages hook với ID user thật
  const { messages, isLoading: messagesLoading, sendMessage, sending } = useRealTimeMessages(
    myId, 
    selectedFriend || ""
  );

  // Handle external chat user selection
  useEffect(() => {
    if (selectedChatUserId) {
      setSelectedFriend(selectedChatUserId);
      setIsChatMinimized(false); // Mở chat khi được chọn từ bên ngoài
    }
  }, [selectedChatUserId]);

  React.useEffect(() => {
    if (!selectedFriend && friends && friends.length > 0) {
      setSelectedFriend(friends[0].id);
    }
  }, [selectedFriend, friends]);

  const selectedFriendData = friends.find(f => f.id === selectedFriend);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || sending) return;
    
    try {
      await sendMessage(chatMessage);
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFriendClick = (friendId: string) => {
    setSelectedFriend(friendId);
    if (onChatUserChange) {
      onChatUserChange(friendId);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="hidden lg:flex flex-col w-[320px] max-w-xs min-w-[280px] pt-6 pr-4 h-full bg-gray-50/30 gap-4">
      {/* Friends List */}
      <div className="flex-shrink-0 mb-4">
        <h3 className="font-bold text-gray-700 text-base pb-3 px-2">Bạn bè đang hoạt động</h3>
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto bg-white rounded-lg shadow-sm border p-2">
          {isLoading && (
            <div className="text-gray-400 py-8 text-center text-sm">
              <div className="animate-pulse">Đang tải...</div>
            </div>
          )}
          {!isLoading && friends.length === 0 && (
            <div className="text-gray-400 py-8 text-center text-sm">
              <MessageCircle className="mx-auto mb-2 w-8 h-8 opacity-50" />
              Chưa có bạn bè nào online
            </div>
          )}
          {friends.map(friend => (
            <button
              key={friend.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]
              ${selectedFriend === friend.id 
                ? "bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 shadow-md" 
                : "hover:bg-gray-50 border border-transparent"
              }`}
              onClick={() => handleFriendClick(friend.id)}
            >
              <div className="relative">
                <img 
                  src={friend.avatar || '/placeholder.svg'} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  friend.online ? "bg-green-500" : "bg-gray-300"
                }`}></span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-gray-800 text-sm truncate">{friend.name}</div>
                <div className="text-xs text-gray-500">
                  {friend.online ? "Đang hoạt động" : "Không hoạt động"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Persistent Chat Window - messages are saved permanently */}
      <div className="flex-1 flex flex-col justify-end">
        {selectedFriend && selectedFriendData ? (
          <Card className="bg-white border shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img 
                    src={selectedFriendData.avatar || '/placeholder.svg'} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/30 shadow-sm" 
                  />
                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${
                    selectedFriendData.online ? "bg-green-400" : "bg-gray-300"
                  }`}></span>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{selectedFriendData.name}</div>
                  <div className="text-xs text-purple-100">
                    {selectedFriendData.online ? "Đang hoạt động" : "Không hoạt động"}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="text-white hover:bg-white/20 p-2 h-auto rounded-full transition-all duration-200 hover:scale-110"
              >
                {isChatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Chat Content - Collapsible */}
            <div className={`transition-all duration-300 ease-in-out ${
              isChatMinimized ? 'max-h-0 opacity-0' : 'max-h-[400px] opacity-100'
            } overflow-hidden`}>
              {/* Messages Area - Persistent messages across tabs */}
              <ScrollArea className="h-48 p-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="space-y-3">
                  {messagesLoading ? (
                    <div className="text-center text-gray-400 text-sm">Đang tải tin nhắn...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm">
                      Bắt đầu cuộc trò chuyện với {selectedFriendData.name}!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === myId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-md ${
                          message.sender_id === myId
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === myId ? 'text-purple-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 text-sm border-gray-200 focus:border-purple-400 rounded-full px-4 py-2 transition-all duration-200 focus:shadow-md"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full p-2 h-10 w-10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    disabled={!chatMessage.trim() || sending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-white border shadow-lg rounded-xl p-6 text-center">
            <MessageCircle className="mx-auto mb-3 w-12 h-12 text-gray-300" />
            <p className="text-gray-500 text-sm">
              Chọn một người bạn để bắt đầu trò chuyện
            </p>
          </Card>
        )}
      </div>
    </aside>
  );
}
