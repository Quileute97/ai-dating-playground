
import React, { useState } from "react";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import PostDetailModal from "./PostDetailModal";
import FriendRequestDetailModal from "./FriendRequestDetailModal";
import ChatWidget from "./ChatWidget";
import { useChatWidget } from "@/hooks/useChatWidget";

interface PanelProps {
  userId?: string;
}

export default function RealTimeActivityPanel({ userId }: PanelProps) {
  const { data: activities, isLoading } = useRecentActivities(userId);
  const navigate = useNavigate();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedFriendRequestId, setSelectedFriendRequestId] = useState<string | null>(null);
  
  const { isOpen, chatUser, openChat, closeChat } = useChatWidget();

  const handleUserClick = (e: React.MouseEvent, activityUserId: string, activityUserName: string, activityUserAvatar: string) => {
    e.stopPropagation();
    if (activityUserId && userId) {
      // Mở chat widget thay vì navigate
      openChat({
        id: activityUserId,
        name: activityUserName || "Người dùng",
        avatar: activityUserAvatar || "/placeholder.svg"
      });
    }
  };

  const handleActivityClick = (activity: any) => {
    console.log('🎯 Activity clicked:', activity);
    
    // Navigate to related content based on activity type
    if (activity.type === "like" && activity.post_id) {
      // Hiển thị modal bài viết cho post likes
      setSelectedPostId(activity.post_id);
    } else if (activity.type === "comment" && activity.post_id) {
      // Hiển thị modal bài viết cho comments
      setSelectedPostId(activity.post_id);
    } else if (activity.type === "friend_request" && activity.friend_request_id) {
      // Hiển thị modal chi tiết lời mời kết bạn
      console.log('🎯 Opening friend request modal for ID:', activity.friend_request_id);
      setSelectedFriendRequestId(activity.friend_request_id);
    } else if (activity.type === "friend") {
      // For friend activities, navigate to user profile
      navigate(`/profile/${activity.user.id}`);
    } else {
      // Default: navigate to user profile
      navigate(`/profile/${activity.user.id}`);
    }
  };

  const getActivityIcon = (activity: any) => {
    switch (activity.type) {
      case "like":
        return <Heart className="w-6 h-6 text-pink-500" />;
      case "friend":
        return <UserPlus className="w-6 h-6 text-green-500" />;
      case "friend_request":
        return <UserPlus className="w-6 h-6 text-blue-500 animate-pulse" />;
      case "comment":
      default:
        return <MessageCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getActivityBorderColor = (activity: any) => {
    switch (activity.type) {
      case "like":
        return "border-pink-200";
      case "friend":
        return "border-green-200";
      case "friend_request":
        return "border-blue-200";
      case "comment":
      default:
        return "border-purple-200";
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
                className={`flex items-center gap-3 py-2 px-3 shadow-sm border-l-4 ${getActivityBorderColor(a)} relative cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => handleActivityClick(a)}
              >
                {getActivityIcon(a)}
                <img
                  src={a.user.avatar || "/placeholder.svg"}
                  alt={a.user.name || "user"}
                  className="w-7 h-7 rounded-full object-cover border border-purple-100 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => handleUserClick(e, a.user.id, a.user.name || "", a.user.avatar || "")}
                />
                <div className="flex-1">
                  <span 
                    className="text-sm text-gray-700 cursor-pointer hover:text-purple-600 transition-colors font-medium"
                    onClick={(e) => handleUserClick(e, a.user.id, a.user.name || "", a.user.avatar || "")}
                  >
                    {a.user.name || "Ai đó"}
                  </span>
                  <span className="text-sm text-gray-700 ml-1">
                    {a.message.replace(a.user.name || "Ai đó", "").trim()}
                  </span>
                  <div className="text-[11px] text-gray-400">{a.created_at && new Date(a.created_at).toLocaleString("vi-VN")}</div>
                  {a.type === "friend_request" && (
                    <div className="text-[10px] text-blue-600 font-semibold mt-1">● Lời mời mới</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </aside>

      {/* Post Detail Modal - Truyền userId để có thể tương tác */}
      <PostDetailModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
        userId={userId}
      />

      {/* Friend Request Detail Modal */}
      <FriendRequestDetailModal
        friendRequestId={selectedFriendRequestId}
        isOpen={!!selectedFriendRequestId}
        onClose={() => setSelectedFriendRequestId(null)}
      />

      {/* Chat Widget */}
      {chatUser && userId && (
        <ChatWidget
          isOpen={isOpen}
          onClose={closeChat}
          userId={chatUser.id}
          userName={chatUser.name}
          userAvatar={chatUser.avatar}
          myUserId={userId}
        />
      )}
    </>
  );
}
