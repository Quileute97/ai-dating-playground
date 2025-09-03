import React, { useState, useMemo } from 'react';
import { Heart, X, Zap, Crown, Star, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useBankInfo } from "@/hooks/useBankInfo";
import DatingProfileView from "./DatingProfileView";
import DatingFeatureBanner from "./DatingFeatureBanner";
import DatingPackageModal from "./DatingPackageModal";
import { useUserLike } from "@/hooks/useUserLike";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useIsDatingActive } from "@/hooks/useDatingSubscription";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useUpdateProfileLocation } from "@/hooks/useUpdateProfileLocation";
import { useDailyMatches } from "@/hooks/useDailyMatches";
import { useChatIntegration } from '@/hooks/useChatIntegration';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFakeUserInteractions } from '@/hooks/useFakeUserInteractions';

interface SwipeInterfaceProps {
  user?: any;
}

const SwipeInterface = ({ user }: SwipeInterfaceProps) => {
  const navigate = useNavigate();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matches, setMatches] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showDatingPackageModal, setShowDatingPackageModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [matchedProfiles, setMatchedProfiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const bankInfoHook = useBankInfo();
  
  // Get user location
  const { position: userLocation, loading: locationLoading } = useGeolocation();
  
  // Update user location in database
  useUpdateProfileLocation(user?.id, userLocation);
  
  // Use dating subscription hook
  const { isActive: isDatingActive, isLoading: datingLoading, subscription: datingSubscription } = useIsDatingActive(user?.id);
  const { likeUser, isProcessing } = useUserLike(user?.id);

  // Use daily matches hook to get real count from database
  const { dailyMatches, loading: dailyMatchesLoading } = useDailyMatches(user?.id);

  // Use real data from database with expanded range (50km for dating vs 5km for nearby)
  const { profiles, loading: profilesLoading } = useNearbyProfiles(user?.id, userLocation, 50);
  
  // Import the chat integration hook
  const { startChatWith } = useChatIntegration();
  
  // Import fake user interactions hook
  const fakeUserInteractions = useFakeUserInteractions(user?.id);
  
  // Fetch liked and matched profiles
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchLikedAndMatchedProfiles = async () => {
      try {
        // Get all profiles this user has liked
        const { data: likedData, error: likedError } = await supabase
          .from('user_likes')
          .select('liked_id')
          .eq('liker_id', user.id);
        
        if (likedError) throw likedError;
        
        // Get all profiles that have mutual likes (matches)
        const { data: matchedData, error: matchedError } = await supabase
          .from('user_likes')
          .select('liked_id, liker_id')
          .or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`);
        
        if (matchedError) throw matchedError;
        
        // Set liked profiles
        const likedIds = new Set<string>(likedData?.map(item => item.liked_id) || []);
        setLikedProfiles(likedIds);
        
        // Find mutual matches
        const userLikes = matchedData?.filter(item => item.liker_id === user.id).map(item => item.liked_id) || [];
        const otherLikes = matchedData?.filter(item => item.liked_id === user.id).map(item => item.liker_id) || [];
        const mutualMatches = userLikes.filter(id => otherLikes.includes(id));
        
        setMatchedProfiles(new Set<string>(mutualMatches));
      } catch (error) {
        console.error('Error fetching liked/matched profiles:', error);
      }
    };
    
    fetchLikedAndMatchedProfiles();
  }, [user?.id]);
  
  const availableProfiles = useMemo(() => {
    console.log('Debug - All profiles:', profiles.length);
    console.log('Debug - User location:', userLocation);
    console.log('Debug - Liked profiles:', likedProfiles.size);
    console.log('Debug - Matched profiles:', matchedProfiles.size);
    
    const filtered = profiles.filter(p => {
      const isValid = p.id !== user?.id && 
        p.name && 
        p.avatar && 
        (p.is_dating_active !== false) && // Support both real and fake users
        !likedProfiles.has(p.id) &&  // Filter out already liked profiles
        !matchedProfiles.has(p.id);   // Filter out already matched profiles
      
      if (!isValid) {
        console.log('Debug - Filtered out profile:', p.name, {
          sameUser: p.id === user?.id,
          hasName: !!p.name,
          hasAvatar: !!p.avatar,
          isDatingActive: p.is_dating_active !== false,
          isLiked: likedProfiles.has(p.id),
          isMatched: matchedProfiles.has(p.id)
        });
      }
      
      return isValid;
    });
    
    console.log('Debug - Available profiles after filter:', filtered.length);
    
    return filtered.map(p => ({
      ...p,
      images: [p.avatar!],
      bio: p.bio || "Chào bạn! Tôi đang tìm kiếm những kết nối thú vị trên ứng dụng này.",
      distance: p.distance || Math.floor(Math.random() * 20) + 1,
      interests: Array.isArray(p.interests) ? p.interests : [],
      age: p.age || 25,
      height: p.height,
      job: p.job,
      education: p.education,
      location_name: p.location_name
    }));
  }, [profiles, user?.id, likedProfiles, matchedProfiles, userLocation]);

  const maxFreeMatches = 10;
  const remainingMatches = maxFreeMatches - dailyMatches;
  const currentProfile = availableProfiles[currentProfileIndex];

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!currentProfile) return;
    
    if (!isDatingActive && dailyMatches >= maxFreeMatches && (direction === 'right' || direction === 'super')) {
      toast({
        title: "Đã hết lượt match miễn phí!",
        description: "Nâng cấp Premium để có không giới hạn lượt match",
        variant: "destructive"
      });
      setShowDatingPackageModal(true);
      return;
    }

    setSwipeDirection(direction === 'super' ? 'right' : direction);

    if (direction === 'right' || direction === 'super') {
      try {
        let res;
        
        // Check if this is a fake user by checking if it exists in fake_users table
        const { data: fakeUserCheck } = await supabase
          .from('fake_users')
          .select('id')
          .eq('id', currentProfile.id)
          .single();
        
        const isFakeUser = !!fakeUserCheck;
        
        if (isFakeUser) {
          // Like fake user
          res = await fakeUserInteractions.likeFakeUser(currentProfile.id);
        } else {
          // Like real user
          res = await likeUser(currentProfile.id);
        }
        
        // Add to liked profiles to prevent showing again
        setLikedProfiles(prev => new Set([...prev, currentProfile.id]));
        
        if (res.matched) {
          // Add to matched profiles to prevent showing again
          setMatchedProfiles(prev => new Set([...prev, currentProfile.id]));
          setMatches(prev => prev + 1);
          setShowMatch(true);
          setTimeout(() => setShowMatch(false), 3000);
          toast({
            title: "It's a Match! 💖",
            description: `Bạn và ${currentProfile.name} đã thích nhau!`,
          });
        } else {
          toast({
            title: "Đã thích!",
            description: `Bạn đã thích ${currentProfile.name}`,
          });
        }
      } catch (e) {
        toast({
          title: "Có lỗi xảy ra!",
          description: "Vui lòng thử lại",
          variant: "destructive"
        });
      }
    }

    setTimeout(() => {
      setCurrentProfileIndex(prev =>
        prev + 1 >= availableProfiles.length ? 0 : prev + 1
      );
      setSwipeDirection(null);
    }, 300);
  };

  const handleProfileClick = () => {
    if (currentProfile) {
      setSelectedProfile(currentProfile);
    }
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
  };

  const handleProfileSwipe = (direction: 'left' | 'right' | 'super') => {
    setSelectedProfile(null);
    handleSwipe(direction);
  };


  const handleChatClick = (profile: any) => {
    // Use unified chat system instead of separate modal
    startChatWith({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar
    });
  };

  if (locationLoading || profilesLoading || dailyMatchesLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50">
        <Card className="p-8 text-center bg-white/70 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {locationLoading ? "Đang xác định vị trí..." : 
             dailyMatchesLoading ? "Đang tải thông tin..." :
             "Đang tải danh sách người dùng..."}
          </h2>
        </Card>
      </div>
    );
  }

  if (!currentProfile) {
    const outOfFreeMatches = !isDatingActive && dailyMatches >= maxFreeMatches;
    const noMoreProfiles = availableProfiles.length === 0;
    
    if (outOfFreeMatches) {
      // Import MatchedUsersView component
      const MatchedUsersView = React.lazy(() => import('./MatchedUsersView'));
      
      return (
        <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {/* Header with upgrade info */}
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm mb-6">
              <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center mb-4">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Hết lượt thả tim miễn phí!
              </h2>
              <p className="text-gray-600 mb-4">
                Bạn đã sử dụng hết {maxFreeMatches} lượt thả tim hôm nay.
              </p>
              <Button
                onClick={() => {
                  console.log('🔥 DEBUG: Nâng cấp Premium button clicked in SwipeInterface (hết lượt)');
                  console.log('🔥 DEBUG: setShowDatingPackageModal called');
                  setShowDatingPackageModal(true);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 mb-4"
              >
                <Crown className="w-4 h-4" />
                Nâng cấp Premium
                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Không giới hạn lượt thả tim</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Xem ai đã thích bạn</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Super Like không giới hạn</span>
                </div>
              </div>
            </Card>
            
            {/* Matched Users List */}
            <React.Suspense fallback={
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            }>
              <MatchedUsersView 
                userId={user?.id}
                onUpgradeClick={() => setShowDatingPackageModal(true)}
              />
            </React.Suspense>
          </div>
        </div>
      );
    }
    
    if (noMoreProfiles) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4">
          <Card className="p-8 text-center bg-white/80 backdrop-blur-sm max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Hết người trong khu vực!
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn đã xem hết tất cả người dùng trong bán kính 50km. Nâng cấp Premium để mở rộng phạm vi tìm kiếm!
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Mở rộng phạm vi tìm kiếm</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Ưu tiên hiển thị hồ sơ</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Xem ai đã thích bạn</span>
              </div>
              <Button
                onClick={() => {
                  console.log('🔥 DEBUG: Nâng cấp Premium button clicked in SwipeInterface (hết người)');
                  console.log('🔥 DEBUG: setShowDatingPackageModal called');
                  setShowDatingPackageModal(true);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Nâng cấp Premium
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Đã kiểm tra {profiles.length} người dùng trong khu vực
            </p>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm max-w-md mx-auto">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang tải...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </Card>
      </div>
    );
  }

  if (selectedProfile) {
    return (
      <DatingProfileView
        profile={selectedProfile}
        onClose={handleCloseProfile}
        onSwipe={handleProfileSwipe}
        isDatingActive={isDatingActive}
        dailyMatches={dailyMatches}
        maxFreeMatches={maxFreeMatches}
      />
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Premium Member Badge */}
      {isDatingActive && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Crown className="w-4 h-4" />
          PREMIUM
        </div>
      )}

      {/* Daily Matches Counter */}
      {!isDatingActive && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
          {remainingMatches <= 3 && (
            <span className="text-red-500">⚠️ </span>
          )}
          {remainingMatches}/10 lượt còn lại
        </div>
      )}

      {/* Match Notification */}
      {showMatch && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/90 to-purple-500/90 backdrop-blur-sm animate-fade-in">
          <div className="text-center text-white animate-scale-in">
            {/* Sparkle Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
              <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
              <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-200 rounded-full animate-bounce" />
              <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-purple-200 rounded-full animate-ping" />
              <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-yellow-200 rounded-full animate-pulse" />
            </div>
            
            {/* Main Heart with Enhanced Animation */}
            <div className="relative mb-6">
              <Heart className="w-24 h-24 mx-auto text-red-400 animate-bounce fill-current" />
              <div className="absolute inset-0 w-24 h-24 mx-auto">
                <Heart className="w-24 h-24 text-red-300 animate-ping opacity-75" />
              </div>
            </div>
            
            {/* Match Text with Gradient */}
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
              It's a Match! 💖
            </h2>
            
            <p className="text-xl mb-8 opacity-90">
              Bạn và <span className="font-semibold">{currentProfile.name}</span> đã thích nhau!
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setShowMatch(false);
                  handleChatClick(currentProfile);
                }}
                className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              >
                💬 Nhắn tin ngay
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMatch(false)}
                className="border-white text-white hover:bg-white/20 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              >
                Tiếp tục khám phá
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="max-w-sm mx-auto h-full flex flex-col">
        <Card 
          className={`flex-1 relative overflow-hidden transition-all duration-300 cursor-pointer ${
            swipeDirection === 'left' ? 'transform -translate-x-full rotate-12 opacity-0' :
            swipeDirection === 'right' ? 'transform translate-x-full -rotate-12 opacity-0' :
            'transform translate-x-0 rotate-0 opacity-100'
          }`}
          onClick={handleProfileClick}
        >
          {/* Profile Image */}
          <div className="relative h-2/3">
            <img 
              src={currentProfile.images[0]} 
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Distance Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
              {currentProfile.distance}km
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold">
                {currentProfile.name}
                {currentProfile.age && <span>, {currentProfile.age}</span>}
              </h2>
              <p className="text-sm opacity-90">Nhấn để xem hồ sơ chi tiết</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 h-1/3 overflow-y-auto">
            <p className="text-gray-700 mb-3">{currentProfile.bio}</p>
            
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests && currentProfile.interests.length > 0 && currentProfile.interests.map((interest: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6 pb-4">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={() => handleSwipe('left')}
          >
            <X className="w-6 h-6 text-red-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => handleSwipe('super')}
            disabled={!isDatingActive && dailyMatches >= maxFreeMatches}
          >
            <Zap className="w-6 h-6 text-blue-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
            onClick={() => handleSwipe('right')}
            disabled={!isDatingActive && dailyMatches >= maxFreeMatches}
          >
            <Heart className="w-6 h-6 text-green-500" />
          </Button>
        </div>

        {/* Compact Premium Banner - only for remaining matches warning */}
        {!isDatingActive && remainingMatches <= 3 && remainingMatches > 0 && (
          <div className="mt-4 p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-semibold">Sắp hết lượt miễn phí!</span>
            </div>
            <p className="text-xs opacity-90 mb-2">Còn {remainingMatches} lượt thả tim</p>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 px-3 text-xs text-orange-600 hover:text-orange-700"
              onClick={() => {
                console.log('🔥 DEBUG: Nâng cấp Premium button clicked in SwipeInterface (compact banner)');
                console.log('🔥 DEBUG: setShowDatingPackageModal called');
                setShowDatingPackageModal(true);
              }}
            >
              Nâng cấp Premium
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="text-center text-sm text-gray-600 mt-2">
          {matches} matches • {availableProfiles.length - currentProfileIndex - 1} còn lại
        </div>
      </div>

      {/* Dating Package Modal */}
      <DatingPackageModal
        isOpen={showDatingPackageModal}
        onClose={() => setShowDatingPackageModal(false)}
        currentUser={user}
        bankInfo={bankInfoHook.bankInfo}
      />
    </div>
  );
};

export default SwipeInterface;