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
        p.is_dating_active &&
        !likedProfiles.has(p.id) &&  // Filter out already liked profiles
        !matchedProfiles.has(p.id);   // Filter out already matched profiles
      
      if (!isValid) {
        console.log('Debug - Filtered out profile:', p.name, {
          sameUser: p.id === user?.id,
          hasName: !!p.name,
          hasAvatar: !!p.avatar,
          isDatingActive: p.is_dating_active,
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
        const res = await likeUser(currentProfile.id);
        
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
    
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm max-w-md mx-auto">
          {outOfFreeMatches ? (
            <>
              <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Hết lượt thả tim miễn phí!
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn đã sử dụng hết {maxFreeMatches} lượt thả tim hôm nay. Nâng cấp Premium để có không giới hạn lượt thả tim!
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Không giới hạn lượt thả tim</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Xem ai đã thích bạn</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Super Like không giới hạn</span>
                </div>
                <Button
                  onClick={() => setShowDatingPackageModal(true)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Nâng cấp Premium
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : noMoreProfiles ? (
            <>
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
                  onClick={() => setShowDatingPackageModal(true)}
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
            </>
          ) : (
            <>
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Đang tải...</h2>
              <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </>
          )}
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/90 to-purple-500/90 backdrop-blur-sm">
          <div className="text-center text-white animate-pulse">
            <Heart className="w-20 h-20 mx-auto mb-4 text-red-300" />
            <h2 className="text-3xl font-bold mb-2">It's a Match! 💖</h2>
            <p className="text-lg">Bạn và {currentProfile.name} đã thích nhau!</p>
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

        {/* Dating Feature Banner - Replace the old upgrade banner */}
        <DatingFeatureBanner
          isDatingActive={isDatingActive}
          datingLoading={datingLoading}
          onClickUpgrade={() => {
            console.log('Upgrade button clicked, navigating to payment page');
            // Navigate to payment page for dating
            navigate('/payment?type=dating&package=dating_week');
          }}
          userId={user?.id}
          dailyMatches={dailyMatches}
          maxFreeMatches={maxFreeMatches}
        />

        {/* Stats */}
        <div className="text-center text-sm text-gray-600 mt-2">
          {matches} matches • {availableProfiles.length - currentProfileIndex - 1} còn lại
        </div>
      </div>

      {/* Dating Package Modal */}
      <DatingPackageModal
        isOpen={showDatingPackageModal}
        onClose={() => setShowDatingPackageModal(false)}
        onSelectPackage={async (packageId) => {
          try {
            const { createDatingPackagePayment } = await import("@/services/datingPackageService");
            setShowDatingPackageModal(false);
            
            const result = await createDatingPackagePayment(packageId, user.id, user.email);
            
            if (result.checkoutUrl) {
              window.open(result.checkoutUrl, '_blank');
              toast({
                title: "Chuyển hướng thanh toán",
                description: "Vui lòng hoàn tất thanh toán để kích hoạt gói Premium",
              });
            } else {
              throw new Error("Không thể tạo liên kết thanh toán");
            }
          } catch (error) {
            console.error('Payment error:', error);
            toast({
              title: "Lỗi tạo thanh toán",
              description: "Không thể tạo liên kết thanh toán. Vui lòng thử lại.",
              variant: "destructive"
            });
          }
        }}
        currentUser={user}
      />
    </div>
  );
};

export default SwipeInterface;
