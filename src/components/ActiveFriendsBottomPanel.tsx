
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronUp, ChevronDown, X } from "lucide-react";
import { useActiveFriendsWithPresence } from "@/hooks/useActiveFriendsWithPresence";

interface ActiveFriendsBottomPanelProps {
  myId: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export default function ActiveFriendsBottomPanel({ 
  myId, 
  isOpen, 
  onToggle 
}: ActiveFriendsBottomPanelProps) {
  if (!myId) throw new Error("Missing myId prop in ActiveFriendsBottomPanel");

  const { friends, isLoading } = useActiveFriendsWithPresence(myId);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedFriend && friends && friends.length > 0) {
      setSelectedFriend(friends[0].id);
    }
  }, [selectedFriend, friends]);

  const handleCloseFriend = () => {
    setSelectedFriend(null);
  };

  return (
    <div className={`relative transition-all duration-300 ease-in-out bg-white border-t shadow-lg ${
      isOpen ? 'h-80' : 'h-12'
    }`}>
      {/* Toggle Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 border-b"
        onClick={() => onToggle(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-500" />
          <span className="font-medium text-gray-700">
            Bạn bè đang hoạt động ({friends.length})
          </span>
        </div>
        <Button variant="ghost" size="sm" className="p-1">
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="flex h-full">
          {/* Friends List */}
          <div className="w-80 border-r bg-gray-50 p-3 overflow-y-auto">
            {isLoading && (
              <div className="text-gray-400 py-4 text-center">Đang tải...</div>
            )}
            {!isLoading && friends.length === 0 && (
              <div className="text-gray-400 py-4 text-center">Bạn chưa có bạn bè nào.</div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-left w-full
                  ${selectedFriend === friend.id ? "bg-purple-100 border-purple-200" : "hover:bg-white border border-transparent"}
                  `}
                  onClick={() => setSelectedFriend(friend.id)}
                >
                  <img 
                    src={friend.avatar || '/placeholder.svg'} 
                    className={`w-10 h-10 rounded-full object-cover border-2 ${
                      friend.online ? "border-green-400" : "border-gray-300"
                    }`} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{friend.name}</div>
                    <div className="flex items-center gap-1">
                      <span className={`block w-2 h-2 rounded-full ${
                        friend.online ? "bg-green-500" : "bg-gray-300"
                      }`}></span>
                      <span className="text-xs text-gray-500">
                        {friend.online ? "Đang online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedFriend ? (
              <Card className="flex-1 flex flex-col h-full rounded-none border-0">
                <div className="flex items-center justify-between p-3 border-b bg-white">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="text-purple-500 w-5 h-5" />
                    <span className="font-medium">Chat với {
                      friends.find(f => f.id === selectedFriend)?.name
                    }</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCloseFriend}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-auto bg-gray-50 p-3 text-sm text-gray-600">
                  {/* Demo chat content */}
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-purple-500 text-white px-3 py-2 rounded-lg max-w-xs">
                        <span className="text-sm">Chào bạn nha 👋</span>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white px-3 py-2 rounded-lg max-w-xs border">
                        <span className="text-sm">Hello! 😄</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 p-3 border-t bg-white">
                  <input 
                    placeholder="Nhập tin nhắn..." 
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  />
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                    Gửi
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chọn một bạn bè để bắt đầu chat</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
