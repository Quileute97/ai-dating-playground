import React, { useState, useMemo } from 'react';
import { Heart, X, Zap, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import { createDatingPackagePayment } from "@/services/datingPackageService";
import { useChatIntegration } from '@/hooks/useChatIntegration';

interface SwipeInterfaceProps {
  user?: any;
}

const SwipeInterface = ({ user }: SwipeInterfaceProps) => {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matches, setMatches] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showDatingPackageModal, setShowDatingPackageModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
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
  
  const availableProfiles = useMemo(() =>
    profiles
      .filter(p => p.id !== user?.id && p.name && p.avatar && p.is_dating_active)
      .map(p => ({
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
      })), [profiles, user?.id]
  );

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
        if (res.matched) {
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

  const handleSelectPackage = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để mua gói Premium",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Đang tạo thanh toán...",
        description: "Vui lòng chờ trong giây lát",
      });

      const result = await createDatingPackagePayment(packageId, user.id, user.email);
      
      if (result.error) {
        toast({
          title: "Có lỗi xảy ra!",
          description: result.message || "Không thể tạo thanh toán",
          variant: "destructive"
        });
        return;
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast({
          title: "Có lỗi xảy ra!",
          description: "Không nhận được URL thanh toán",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Có lỗi xảy ra!",
        description: "Vui lòng thử lại sau",
        variant: "destructive"
      });
    }
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
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50">
        <Card className="p-8 text-center bg-white/70 backdrop-blur-sm">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Hết người rồi!</h2>
          <p className="text-gray-600 mb-4">Hãy quay lại sau để gặp thêm người dùng mới</p>
          <p className="text-sm text-gray-500">
            Tìm thấy {profiles.length} người dùng trong bán kính 50km
          </p>
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
          onClickUpgrade={() => setShowDatingPackageModal(true)}
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
        onSelectPackage={handleSelectPackage}
        currentUser={user}
        bankInfo={
          !bankInfoHook.loading && bankInfoHook.bankInfo.bankName 
          ? bankInfoHook.bankInfo 
          : undefined
        }
      />
    </div>
  );
};

export default SwipeInterface;
