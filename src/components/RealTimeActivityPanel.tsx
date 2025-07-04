
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, UserPlus, MessageCircle, Eye, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'like' | 'friend_request' | 'message' | 'profile_view';
  user_id: string;
  target_user_id?: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  content?: string;
}

interface RealTimeActivityPanelProps {
  currentUserId?: string;
}

const RealTimeActivityPanel: React.FC<RealTimeActivityPanelProps> = ({ currentUserId }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['real-time-activities', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      // Get recent likes on user's profile
      const { data: likesData } = await supabase
        .from('user_likes')
        .select(`
          id,
          created_at,
          liker_id,
          profiles!user_likes_liker_id_fkey (
            name,
            avatar
          )
        `)
        .eq('liked_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent friend requests
      const { data: friendRequestsData } = await supabase
        .from('friends')
        .select(`
          id,
          created_at,
          user_id,
          profiles!friends_user_id_fkey (
            name,
            avatar
          )
        `)
        .eq('friend_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent messages
      const { data: messagesData } = await supabase
        .from('timeline_messages')
        .select(`
          id,
          created_at,
          sender_id,
          content,
          profiles!timeline_messages_sender_id_fkey (
            name,
            avatar
          )
        `)
        .eq('receiver_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Combine and format activities
      const activities: Activity[] = [];

      if (likesData) {
        likesData.forEach(like => {
          activities.push({
            id: `like_${like.id}`,
            type: 'like',
            user_id: like.liker_id,
            created_at: like.created_at,
            user_name: like.profiles?.name || 'Unknown',
            user_avatar: like.profiles?.avatar,
          });
        });
      }

      if (friendRequestsData) {
        friendRequestsData.forEach(request => {
          activities.push({
            id: `friend_request_${request.id}`,
            type: 'friend_request',
            user_id: request.user_id,
            created_at: request.created_at,
            user_name: request.profiles?.name || 'Unknown',
            user_avatar: request.profiles?.avatar,
          });
        });
      }

      if (messagesData) {
        messagesData.forEach(message => {
          activities.push({
            id: `message_${message.id}`,
            type: 'message',
            user_id: message.sender_id,
            created_at: message.created_at,
            user_name: message.profiles?.name || 'Unknown',
            user_avatar: message.profiles?.avatar,
            content: message.content?.substring(0, 50) + (message.content && message.content.length > 50 ? '...' : ''),
          });
        });
      }

      // Sort by created_at desc
      return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!currentUserId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'profile_view':
        return <Eye className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'like':
        return 'đã thích bạn';
      case 'friend_request':
        return 'đã gửi lời mời kết bạn';
      case 'message':
        return `đã gửi tin nhắn: ${activity.content}`;
      case 'profile_view':
        return 'đã xem hồ sơ của bạn';
      default:
        return 'có hoạt động mới';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'friend_request':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-green-50 border-green-200';
      case 'profile_view':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Chưa có hoạt động nào</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Hoạt động gần đây
          <Badge variant="secondary">{activities.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="space-y-2 p-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border transition-colors hover:shadow-sm ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.user_avatar} />
                    <AvatarFallback>{activity.user_name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <span className="font-medium text-sm truncate">
                        {activity.user_name}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      {getActivityText(activity)}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealTimeActivityPanel;
