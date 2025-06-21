
import React, { useState } from "react";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import PostDetailModal from "./PostDetailModal";
import FriendRequestDetailModal from "./FriendRequestDetailModal";

interface PanelProps {
  userId?: string;
  onUserChatSelect?: (userId: string) => void; // Thêm prop để handle chat
}

export default function RealTimeActivityPanel({ userId, onUserChatSelect }: PanelProps) {
  const { data: activities, isLoading } = useRecentActivities(userId);
  const navigate = useNavigate();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedFriendRequestId, setSelectedFriendRequestId] = useState<string | null>(null);

  const handleUserClick = (e: React.MouseEvent, activityUserId: string) => {
    e.stopPropagation();
    if (activityUserId) {
      // Nếu có callback để mở chat, sử dụng nó
      if (onUserChatSelect) {
        onUserChatSelect(activityUserId);
      } else {
        // Fallback về navigate profile
        navigate(`/profile/${activityUserId}`);
      }
    }
  };

  const handleActivityClick = (activity: any) => {
    // Navigate to related content based on activity type
    if (activity.type === "like" && activity.post_id) {
      // Hiển thị modal bài viết cho post likes
      setSelectedPostId(activity.post_id);
    } else if (activity.type === "comment" && activity.post_id) {
      // Hiển thị modal bài viết cho comments
      setSelectedPostId(activity.post_id);
    } else if (activity.type === "friend_request" && activity.friend_request_id) {
      // Hiển thị modal chi tiết lời mời kết bạn
      setSelectedFriendRequestId(activity.friend_request_id);
    } else if (activity.type === "friend") {
      // For friend activities, navigate to user profile
      navigate(`/profile/${activity.user_id}`);
    } else {
      // Default: navigate to user profile
      navigate(`/profile/${activity.user_id}`);
    }
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col gap-4 w-[300px] max-w-xs min-w-[240px] pt-6 pl-4">
        {/* Recent Activities */}
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-bold text-gray-700 text-base pb-1">Hoạt động mới</h3>
          <div className="flex flex-col gap-2">
            {isLoading && Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 w-full" />
            ))}
            {activities && activities.length === 0 && (
              <p className="text-xs text-gray-400 py-4 text-center">Không có hoạt động mới.</p>
            )}
            {activities?.map(a => (
              <Card
                key={a.id}
                className={`flex items-center gap-3 py-2 px-3 shadow-sm border-l-4 border-purple-200 relative cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => handleActivityClick(a)}
              >
                {a.type === "like" ? (
                  <Heart className="w-6 h-6 text-pink-500" />
                ) : a.type === "friend" ? (
                  <UserPlus className="w-6 h-6 text-green-500" />
                ) : a.type === "friend_request" ? (
                  <UserPlus className="w-6 h-6 text-blue-500" />
                ) : (
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                )}
                <img
                  src={a.user_avatar || "/placeholder.svg"}
                  alt={a.user_name || "user"}
                  className="w-7 h-7 rounded-full object-cover border border-purple-100 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => handleUserClick(e, a.user_id)}
                />
                <div className="flex-1">
                  <span 
                    className="text-sm text-gray-700 cursor-pointer hover:text-purple-600 transition-colors font-medium"
                    onClick={(e) => handleUserClick(e, a.user_id)}
                  >
                    {a.user_name || "Ai đó"}
                  </span>
                  <span className="text-sm text-gray-700 ml-1">
                    {a.text.replace(a.user_name || "Ai đó", "").trim()}
                  </span>
                  <div className="text-[11px] text-gray-400">{a.created_at && new Date(a.created_at).toLocaleString("vi-VN")}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </aside>

      {/* Post Detail Modal */}
      <PostDetailModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />

      {/* Friend Request Detail Modal */}
      <FriendRequestDetailModal
        friendRequestId={selectedFriendRequestId}
        isOpen={!!selectedFriendRequestId}
        onClose={() => setSelectedFriendRequestId(null)}
      />
    </>
  );
}
