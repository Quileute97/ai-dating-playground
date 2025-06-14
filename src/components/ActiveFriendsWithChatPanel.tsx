
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useActiveFriendsWithPresence } from "@/hooks/useActiveFriendsWithPresence";
import { useUser } from "@/hooks/useUser"; // Nếu có custom hook lấy user, import nó

// Nhận userId qua props hoặc custom hook, VD:
const getCurrentUserId = () => {
  // Nếu có hook useUser hoặc lấy từ context app hãy dùng ở đây
  // return user?.id hoặc lấy logic tương đương
  // Có thể xóa/đổi hàm này khi đã truyền props userId cho component
  return window?.CURRENT_USER_ID || null;
};

export default function ActiveFriendsWithChatPanel() {
  // Đổi lại: lấy id từ context/app nếu đã có, hoặc truyền prop từ cha.
  // Bạn có thể truyền userId từ props nếu cần tuỳ vào chỗ sử dụng panel trên app.
  const myId = getCurrentUserId();
  const { friends, isLoading } = useActiveFriendsWithPresence(myId || undefined);

  // Chọn mặc định bạn bè đầu tiên (nếu có)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedFriend && friends && friends.length > 0) {
      setSelectedFriend(friends[0].id);
    }
  }, [selectedFriend, friends]);

  return (
    <aside className="hidden lg:flex flex-col w-[300px] max-w-xs min-w-[240px] pt-6 pr-4">
      <div>
        <h3 className="font-bold text-gray-700 text-base pb-2">Bạn bè đang hoạt động</h3>
        <div className="flex flex-col gap-2">
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
                <span className="text-sm font-medium">{friend.name}</span>
                <span className={`ml-auto block w-2 h-2 rounded-full ${friend.online ? "bg-green-500" : "bg-gray-300"}`}></span>
              </button>
            ))
          }
        </div>
      </div>

      {/* Chat Window, xuất hiện khi chọn 1 friend */}
      <div className="mt-4 flex-1 flex flex-col">
        {selectedFriend && (
          <Card className="flex-1 flex flex-col p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="text-purple-500" />
              <span className="font-medium text-base">Chat với {
                friends.find(f => f.id === selectedFriend)?.name
              }</span>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 rounded mb-2 p-2 text-xs text-gray-600">
              {/* Demo chat content */}
              <div><span className="font-bold text-gray-800">Bạn: </span>Chào bạn nha 👋</div>
              <div><span className="font-bold text-purple-600">{
                friends.find(f => f.id === selectedFriend)?.name
              }:</span> Hello! 😄</div>
            </div>
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
