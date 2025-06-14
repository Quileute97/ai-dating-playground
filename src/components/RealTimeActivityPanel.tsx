
import React from "react";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";

const MOCK_ACTIVITIES = [
  { id: 1, type: "like", icon: <Heart className="text-pink-500" />, text: "AI vừa like hình của bạn" },
  { id: 2, type: "like", icon: <Heart className="text-purple-500" />, text: "Minh vừa thích ảnh của bạn" },
  { id: 3, type: "comment", icon: <MessageCircle className="text-blue-500" />, text: "Linh vừa bình luận: 'Đẹp quá!'" },
  { id: 4, type: "friend", icon: <UserPlus className="text-green-500" />, text: "Thuý vừa gửi lời mời kết bạn cho bạn" },
];

export default function RealTimeActivityPanel() {
  return (
    <aside className="hidden lg:flex flex-col gap-2 w-[300px] max-w-xs min-w-[240px] pt-6 pl-4">
      <h3 className="font-bold text-gray-700 text-base pb-1">Hoạt động mới</h3>
      <div className="flex flex-col gap-2">
        {MOCK_ACTIVITIES.map(a => (
          <Card key={a.id} className="flex items-center gap-3 py-2 px-3 shadow-sm border-l-4 border-purple-200">
            <span>{a.icon}</span>
            <span className="text-sm text-gray-700">{a.text}</span>
          </Card>
        ))}
      </div>
    </aside>
  );
}
