import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Crown, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useChatIntegration } from '@/hooks/useChatIntegration';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';

interface MatchedUser {
  id: string;
  name: string;
  avatar: string;
  gender?: string;
  distance?: number;
}

interface MatchedUsersViewProps {
  userId: string;
  onUpgradeClick: () => void;
}

const MatchedUsersView: React.FC<MatchedUsersViewProps> = ({ userId, onUpgradeClick }) => {
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { startChatWith } = useChatIntegration();
  const { getDatingRequiresPremium } = useAdminSettings();
  
  const premiumRequired = getDatingRequiresPremium();

  useEffect(() => {
    const fetchMatchedUsers = async () => {
      try {
        setLoading(true);
        
        // Get all profiles that have mutual likes (matches)
        const { data: matchedData, error: matchedError } = await supabase
          .from('user_likes')
          .select('liked_id, liker_id')
          .or(`liker_id.eq.${userId},liked_id.eq.${userId}`);
        
        if (matchedError) throw matchedError;
        
        // Find mutual matches
        const userLikes = matchedData?.filter(item => item.liker_id === userId).map(item => item.liked_id) || [];
        const otherLikes = matchedData?.filter(item => item.liked_id === userId).map(item => item.liker_id) || [];
        const mutualMatchIds = userLikes.filter(id => otherLikes.includes(id));
        
        // Get profile details for matched users
        if (mutualMatchIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, avatar, gender')
            .in('id', mutualMatchIds);
          
          if (profilesError) throw profilesError;
          
          const mutualMatches: MatchedUser[] = profilesData?.map(profile => ({
            id: profile.id,
            name: profile.name || 'Ẩn danh',
            avatar: profile.avatar || '',
            gender: profile.gender,
            distance: Math.floor(Math.random() * 20) + 1 // Mock distance for now
          })) || [];
          
          setMatchedUsers(mutualMatches);
        } else {
          setMatchedUsers([]);
        }
      } catch (error) {
        console.error('Error fetching matched users:', error);
        setMatchedUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchMatchedUsers();
    }
  }, [userId]);

  const handleChatClick = (user: MatchedUser) => {
    startChatWith({
      id: user.id,
      name: user.name,
      avatar: user.avatar
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải danh sách match...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Các Match của bạn</h2>
        <p className="text-sm text-gray-600">
          {matchedUsers.length > 0 
            ? `Bạn có ${matchedUsers.length} match. Nhắn tin để bắt đầu trò chuyện!`
            : 'Chưa có match nào. Tiếp tục thả tim để tìm người phù hợp!'
          }
        </p>
      </div>

      {matchedUsers.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {matchedUsers.map((user) => (
            <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getDefaultAvatar(user.gender, user.avatar)}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.distance}km</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleChatClick(user)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Nhắn tin
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">
            {premiumRequired 
              ? "Chưa có match nào. Nâng cấp Premium để có thêm cơ hội tìm kiếm!"
              : "Chưa có match nào. Tiếp tục swipe để tìm người phù hợp!"
            }
          </p>
          {premiumRequired && (
            <Button
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Nâng cấp Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </Card>
      )}

      {/* Upgrade suggestion - only show if premium is required */}
      {premiumRequired && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center">
            <Crown className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Muốn thêm Match?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Nâng cấp Premium để có không giới hạn lượt thả tim và nhiều tính năng khác!
            </p>
            <Button
              size="sm"
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Crown className="w-4 h-4 mr-1" />
              Xem gói Premium
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MatchedUsersView;