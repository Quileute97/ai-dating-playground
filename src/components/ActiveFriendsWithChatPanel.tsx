
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Minimize2, Maximize2, MoreHorizontal, Search, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const { messages, isLoading: messagesLoading, sendMessage, sending } = useRealTimeMessages(
    myId, 
    selectedFriend || ""
  );

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[320px] max-w-xs min-w-[280px] pt-4 pr-4 h-full bg-white border-l border-gray-200 gap-3">
      {/* Friends List - Enhanced Facebook style */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="font-semibold text-gray-900 text-base">Bạn bè</h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-all duration-200"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-all duration-200">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 pb-3 animate-fade-in">
            <div className="relative">
              <Input
                placeholder="Tìm kiếm bạn bè..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm pr-8 bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-6 w-6 rounded-full hover:bg-gray-200"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="max-h-[280px] overflow-y-auto">
          {isLoading && (
            <div className="text-gray-400 py-6 text-center text-sm">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
          {!isLoading && filteredFriends.length === 0 && !searchQuery && (
            <div className="text-gray-400 py-6 text-center text-sm">
              <MessageCircle className="mx-auto mb-2 w-6 h-6 opacity-50" />
              Không có bạn bè nào online
            </div>
          )}
          {!isLoading && filteredFriends.length === 0 && searchQuery && (
            <div className="text-gray-400 py-6 text-center text-sm">
              <Search className="mx-auto mb-2 w-6 h-6 opacity-50" />
              Không tìm thấy bạn bè nào
            </div>
          )}
          {filteredFriends.map(friend => (
            <button
              key={friend.id}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all duration-200 group ${
                selectedFriend === friend.id 
                  ? "bg-blue-50 border-r-2 border-blue-500" 
                  : ""
              }`}
              onClick={() => handleFriendClick(friend.id)}
            >
              <div className="relative">
                <img 
                  src={friend.avatar || '/placeholder.svg'} 
                  className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow duration-200" 
                />
                {friend.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors duration-200">
                  {friend.name}
                </div>
                {friend.online ? (
                  <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Đang hoạt động
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Không hoạt động</div>
                )}
              </div>
              {/* Unread message badge placeholder */}
              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Facebook-style Chat Window */}
      <div className="flex-1 flex flex-col justify-end">
        {selectedFriend && selectedFriendData ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-scale-in">
            {/* Chat Header - Enhanced Facebook style */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
              <button 
                onClick={() => handleUserNameClick(selectedFriend)}
                className="flex items-center gap-3 min-w-0 hover:bg-white/10 rounded-lg p-2 transition-all duration-200 flex-1 -ml-2"
              >
                <div className="relative">
                  <img 
                    src={selectedFriendData.avatar || '/placeholder.svg'} 
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/20 shadow-sm" 
                  />
                  {selectedFriendData.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></span>
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-medium text-white text-sm truncate hover:text-blue-100 transition-colors">
                    {selectedFriendData.name}
                  </div>
                  <div className="text-xs text-blue-100 flex items-center gap-1">
                    {selectedFriendData.online ? (
                      <>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        Đang hoạt động
                      </>
                    ) : (
                      "Không hoạt động"
                    )}
                  </div>
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="text-white hover:bg-white/10 p-2 h-auto rounded-full transition-all duration-200"
              >
                {isChatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Chat Content */}
            <div className={`transition-all duration-300 ease-in-out ${
              isChatMinimized ? 'max-h-0 opacity-0' : 'max-h-[400px] opacity-100'
            } overflow-hidden`}>
              {/* Messages Area - Enhanced Facebook style */}
              <ScrollArea className="h-64 p-4 bg-gray-50">
                <div className="space-y-3">
                  {messagesLoading ? (
                    <div className="text-center text-gray-400 text-sm py-4 flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      Đang tải tin nhắn...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="font-medium mb-1">Bắt đầu cuộc trò chuyện</p>
                      <p className="text-xs">Gửi tin nhắn đầu tiên cho {selectedFriendData.name}!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === myId ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all duration-200 hover:shadow-md ${
                          message.sender_id === myId
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-white border border-gray-100 text-gray-800'
                        }`}>
                          <p className="break-words leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-1.5 ${
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

              {/* Message Input - Enhanced Facebook style */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-3 items-end">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Aa"
                    className="flex-1 text-sm border-0 focus:ring-1 focus:ring-blue-500 rounded-full px-4 py-2.5 bg-gray-100 focus:bg-white transition-all duration-200 resize-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full p-2.5 h-10 w-10 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    disabled={!chatMessage.trim() || sending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Chọn bạn bè để trò chuyện</p>
            <p className="text-gray-400 text-xs">Bắt đầu cuộc trò chuyện với bạn bè của bạn</p>
          </div>
        )}
      </div>
    </aside>
  );
}
