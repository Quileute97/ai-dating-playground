
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Minimize2, Maximize2, MoreHorizontal } from "lucide-react";
import { useActiveFriendsWithPresence } from "@/hooks/useActiveFriendsWithPresence";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

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
  if (!myId) throw new Error("Missing myId prop in ActiveFriendsWithChatPanel");

  const { friends, isLoading } = useActiveFriendsWithPresence(myId);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const navigate = useNavigate();

  const { messages, isLoading: messagesLoading, sendMessage, sending } = useRealTimeMessages(
    myId, 
    selectedFriend || ""
  );

  // Handle external chat user selection
  useEffect(() => {
    if (selectedChatUserId) {
      setSelectedFriend(selectedChatUserId);
      setIsChatMinimized(false);
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

  const handleUserNameClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="hidden lg:flex flex-col w-[320px] max-w-xs min-w-[280px] pt-4 pr-4 h-full bg-white border-l border-gray-200 gap-3">
      {/* Friends List - Facebook style */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="font-semibold text-gray-900 text-base">Bạn bè</h3>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="max-h-[280px] overflow-y-auto">
          {isLoading && (
            <div className="text-gray-400 py-6 text-center text-sm">
              <div className="animate-pulse">Đang tải...</div>
            </div>
          )}
          {!isLoading && friends.length === 0 && (
            <div className="text-gray-400 py-6 text-center text-sm">
              <MessageCircle className="mx-auto mb-2 w-6 h-6 opacity-50" />
              Không có bạn bè nào online
            </div>
          )}
          {friends.map(friend => (
            <button
              key={friend.id}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors duration-150 ${
                selectedFriend === friend.id 
                  ? "bg-blue-50 border-r-2 border-blue-500" 
                  : ""
              }`}
              onClick={() => handleFriendClick(friend.id)}
            >
              <div className="relative">
                <img 
                  src={friend.avatar || '/placeholder.svg'} 
                  className="w-9 h-9 rounded-full object-cover" 
                />
                {friend.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{friend.name}</div>
                {friend.online && (
                  <div className="text-xs text-green-600 font-medium">Đang hoạt động</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Facebook-style Chat Window */}
      <div className="flex-1 flex flex-col justify-end">
        {selectedFriend && selectedFriendData ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {/* Chat Header - Facebook style */}
            <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
              <button 
                onClick={() => handleUserNameClick(selectedFriend)}
                className="flex items-center gap-3 min-w-0 hover:bg-gray-50 rounded-lg p-2 transition-colors flex-1 -ml-2"
              >
                <div className="relative">
                  <img 
                    src={selectedFriendData.avatar || '/placeholder.svg'} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  {selectedFriendData.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-medium text-gray-900 text-sm truncate hover:text-blue-600 transition-colors">
                    {selectedFriendData.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedFriendData.online ? "Đang hoạt động" : "Không hoạt động"}
                  </div>
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="text-gray-500 hover:bg-gray-100 p-2 h-auto rounded-full"
              >
                {isChatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Chat Content */}
            <div className={`transition-all duration-300 ease-in-out ${
              isChatMinimized ? 'max-h-0 opacity-0' : 'max-h-[400px] opacity-100'
            } overflow-hidden`}>
              {/* Messages Area - Facebook style */}
              <ScrollArea className="h-64 p-3 bg-gray-50">
                <div className="space-y-2">
                  {messagesLoading ? (
                    <div className="text-center text-gray-400 text-sm py-4">Đang tải tin nhắn...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      <MessageCircle className="mx-auto mb-2 w-8 h-8 opacity-50" />
                      Bắt đầu cuộc trò chuyện với {selectedFriendData.name}!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === myId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          message.sender_id === myId
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                        }`}>
                          <p className="break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === myId ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input - Facebook style */}
              <div className="p-3 bg-white border-t border-gray-200">
                <div className="flex gap-2 items-center">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Aa"
                    className="flex-1 text-sm border-gray-300 focus:border-blue-500 rounded-full px-4 py-2 bg-gray-100 border-0 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 h-8 w-8 shadow-none"
                    disabled={!chatMessage.trim() || sending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
            <MessageCircle className="mx-auto mb-3 w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-sm">
              Chọn một người bạn để bắt đầu trò chuyện
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
