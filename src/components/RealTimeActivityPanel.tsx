
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
      const { data: likesData, error: likesError } = await supabase
        .from('user_likes')
        .select('id, created_at, liker_id')
        .eq('liked_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (likesError) {
        console.error('Error fetching likes:', likesError);
      }

      // Get recent friend requests
      const { data: friendRequestsData, error: friendError } = await supabase
        .from('friends')
        .select('id, created_at, user_id')
        .eq('friend_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (friendError) {
        console.error('Error fetching friend requests:', friendError);
      }

      // Get recent messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('timeline_messages')
        .select('id, created_at, sender_id, content')
        .eq('receiver_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      // Collect all user IDs that we need profile data for
      const userIds = new Set<string>();
      
      if (likesData) {
        likesData.forEach(like => userIds.add(like.liker_id));
      }
      
      if (friendRequestsData) {
        friendRequestsData.forEach(request => userIds.add(request.user_id));
      }
      
      if (messagesData) {
        messagesData.forEach(message => userIds.add(message.sender_id));
      }

      // Fetch all profile data in one query
      let profilesData: any[] = [];
      if (userIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .in('id', Array.from(userIds));
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Create a map for quick profile lookup
      const profileMap = new Map();
      profilesData.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Combine and format activities
      const activities: Activity[] = [];

      if (likesData) {
        likesData.forEach(like => {
          const profile = profileMap.get(like.liker_id);
          activities.push({
            id: `like_${like.id}`,
            type: 'like',
            user_id: like.liker_id,
            created_at: like.created_at,
            user_name: profile?.name || 'Unknown',
            user_avatar: profile?.avatar,
          });
        });
      }

      if (friendRequestsData) {
        friendRequestsData.forEach(request => {
          const profile = profileMap.get(request.user_id);
          activities.push({
            id: `friend_request_${request.id}`,
            type: 'friend_request',
            user_id: request.user_id,
            created_at: request.created_at,
            user_name: profile?.name || 'Unknown',
            user_avatar: profile?.avatar,
          });
        });
      }

      if (messagesData) {
        messagesData.forEach(message => {
          const profile = profileMap.get(message.sender_id);
          activities.push({
            id: `message_${message.id}`,
            type: 'message',
            user_id: message.sender_id,
            created_at: message.created_at,
            user_name: profile?.name || 'Unknown',
            user_avatar: profile?.avatar,
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
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Hoạt động gần đây
          </h2>
        </div>
        <div className="flex-1 p-4">
          <div className="text-center text-gray-500 text-sm">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Hoạt động gần đây
          </h2>
        </div>
        <div className="flex-1 p-4">
          <div className="text-center text-gray-500 text-sm">Chưa có hoạt động nào</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Hoạt động gần đây
          <Badge variant="secondary" className="ml-auto">{activities.length}</Badge>
        </h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
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
    </div>
  );
};

export default RealTimeActivityPanel;
