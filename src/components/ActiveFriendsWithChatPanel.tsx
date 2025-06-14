
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const MOCK_FRIENDS = [
  { id: 1, name: "Minh", avatar: "https://randomuser.me/api/portraits/men/36.jpg", online: true },
  { id: 2, name: "Linh", avatar: "https://randomuser.me/api/portraits/women/65.jpg", online: true },
  { id: 3, name: "Thuý", avatar: "https://randomuser.me/api/portraits/women/78.jpg", online: true },
  { id: 4, name: "Phong", avatar: "https://randomuser.me/api/portraits/men/16.jpg", online: false },
];

export default function ActiveFriendsWithChatPanel() {
  const [selectedFriend, setSelectedFriend] = useState<number | null>(MOCK_FRIENDS[0].id);

  return (
    <aside className="hidden lg:flex flex-col w-[300px] max-w-xs min-w-[240px] pt-6 pr-4">
      {/* Friends Online */}
      <div>
        <h3 className="font-bold text-gray-700 text-base pb-2">Bạn bè đang hoạt động</h3>
        <div className="flex flex-col gap-2">
          {MOCK_FRIENDS.filter(f => f.online).map(friend => (
            <button
              key={friend.id}
              className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors
              ${selectedFriend === friend.id ? "bg-purple-100" : "hover:bg-gray-100"}
              `}
              onClick={() => setSelectedFriend(friend.id)}
            >
              <img src={friend.avatar} className="w-8 h-8 rounded-full object-cover border-2 border-green-400" />
              <span className="text-sm font-medium">{friend.name}</span>
              <span className="ml-auto block w-2 h-2 rounded-full bg-green-500"></span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window, xuất hiện khi chọn 1 friend */}
      <div className="mt-4 flex-1 flex flex-col">
        {selectedFriend && (
          <Card className="flex-1 flex flex-col p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="text-purple-500" />
              <span className="font-medium text-base">Chat với {
                MOCK_FRIENDS.find(f => f.id === selectedFriend)?.name
              }</span>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 rounded mb-2 p-2 text-xs text-gray-600">
              {/* Demo chat content */}
              <div><span className="font-bold text-gray-800">Bạn: </span>Chào bạn nha 👋</div>
              <div><span className="font-bold text-purple-600">{
                MOCK_FRIENDS.find(f => f.id === selectedFriend)?.name
              }:</span> Hello! 😄</div>
            </div>
            {/* Input demo */}
            <div className="flex gap-2">
              <input placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 border rounded" />
              <button className="px-3 py-2 bg-purple-500 text-white rounded">Gửi</button>
            </div>
          </Card>
        )}
      </div>
    </aside>
  );
}
