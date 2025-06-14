
import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";

const MOCK_ACTIVITIES = [
  { id: 1, type: "like", icon: <Heart className="text-pink-500" />, text: "AI vừa like hình của bạn" },
  { id: 2, type: "like", icon: <Heart className="text-purple-500" />, text: "Minh vừa thích ảnh của bạn" },
  { id: 3, type: "comment", icon: <MessageCircle className="text-blue-500" />, text: "Linh vừa bình luận: 'Đẹp quá!'" },
  { id: 4, type: "friend", icon: <UserPlus className="text-green-500" />, text: "Thuý vừa gửi lời mời kết bạn cho bạn" },
];

// Tạo key riêng cho hoạt động "new"
type Activity = typeof MOCK_ACTIVITIES[0] & { isNew?: boolean };

export default function RealTimeActivityPanel() {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [lastPushedId, setLastPushedId] = useState<number | null>(null);

  // Demo: Mỗi 10s sẽ thêm hoạt động mới vào đầu danh sách với hiệu ứng
  useEffect(() => {
    const interval = setInterval(() => {
      const newId = Math.max(...activities.map(a => a.id)) + 1;
      const random = Math.floor(Math.random() * 3);
      const arr = [
        { type: "like", icon: <Heart className="text-pink-500" />, text: "AI vừa like bài post của bạn" },
        { type: "comment", icon: <MessageCircle className="text-purple-500" />, text: "Một người lạ vừa bình luận: 'Hay quá!'" },
        { type: "friend", icon: <UserPlus className="text-green-500" />, text: "Một người mới vừa gửi lời mời kết bạn!" }
      ];
      setActivities(a => [
        { id: newId, ...arr[random], isNew: true },
        ...a.slice(0, 7)
      ]);
      setLastPushedId(newId);
    }, 10000);
    return () => clearInterval(interval);
  }, [activities]);

  // Sau 2 giây thì bỏ hiệu ứng highlight của item mới
  useEffect(() => {
    if (!lastPushedId) return;
    const timer = setTimeout(() => {
      setActivities(current =>
        current.map(act =>
          act.id === lastPushedId ? { ...act, isNew: false } : act
        )
      );
    }, 2000);
    return () => clearTimeout(timer);
  }, [lastPushedId]);

  return (
    <aside className="hidden lg:flex flex-col gap-2 w-[300px] max-w-xs min-w-[240px] pt-6 pl-4">
      <h3 className="font-bold text-gray-700 text-base pb-1">Hoạt động mới</h3>
      <div className="flex flex-col gap-2">
        {activities.map(a => (
          <Card
            key={a.id}
            className={`flex items-center gap-3 py-2 px-3 shadow-sm border-l-4 border-purple-200 relative
              ${a.isNew ? "animate-fade-in ring-2 ring-pink-300" : ""}
            `}
            style={{
              zIndex: a.isNew ? 2 : 1,
              background: a.isNew ? "#fff0fc" : undefined
            }}
          >
            <span>{a.icon}</span>
            <span className="text-sm text-gray-700">{a.text}</span>
            {a.isNew && (
              <span className="absolute right-2 top-2 text-xs animate-pulse text-pink-500 font-semibold">Mới</span>
            )}
          </Card>
        ))}
      </div>
    </aside>
  );
}
