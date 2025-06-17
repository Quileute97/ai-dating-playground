
import React, { useState, useMemo } from 'react';
import { Heart, X, Zap, ArrowLeft, Crown, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PayOSModal from './PayOSModal';
import { useBankInfo } from "@/hooks/useBankInfo";
import { useUpgradeStatus } from './hooks/useUpgradeStatus';
import { useUserLike } from "@/hooks/useUserLike";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import NearbyFeatureBanner from "@/components/NearbyFeatureBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface SwipeInterfaceProps {
  user?: any;
}

const SwipeInterface = ({ user }: SwipeInterfaceProps) => {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matches, setMatches] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [dailyMatches, setDailyMatches] = useState(0);
  const [isGoldActive, setIsGoldActive] = useState(false);
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const { toast } = useToast();
  const bankInfoHook = useBankInfo();
  const { data: goldUpgrade, isLoading: goldLoading } = useUpgradeStatus(user?.id, 'gold');
  const { data: nearbyUpgrade, isLoading: nearbyLoading } = useUpgradeStatus(user?.id, 'nearby');
  const { likeUser, isProcessing } = useUserLike(user?.id);

  // Lấy profile thật từ Supabase, trừ user hiện tại
  const { profiles, loading: profilesLoading } = useNearbyProfiles(user?.id, null, 1000);
  
  // Xử lý để loại bỏ user hiện tại, và profile chưa đủ thông tin cơ bản
  const availableProfiles = useMemo(() =>
    profiles
      .filter(p => p.id !== user?.id && p.name && p.avatar)
      .map(p => ({
        ...p,
        images: [p.avatar!],
        bio: p.bio || "Người dùng thật trên hệ thống.",
        distance: p.lat && p.lng ? 0 : null,
        interests: p.interests || [],
      })), [profiles, user?.id]
  );

  const maxFreeMatches = 10;
  const remainingMatches = maxFreeMatches - dailyMatches;

  const currentProfile = availableProfiles[currentProfileIndex];

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!currentProfile) return;
    
    // Giới hạn lượt swipe nếu chưa phải Gold
    if (!isGoldActive && dailyMatches >= maxFreeMatches && (direction === 'right' || direction === 'super')) {
      toast({
        title: "Đã hết lượt match miễn phí!",
        description: "Nâng cấp GOLD để có không giới hạn lượt match",
        variant: "destructive"
      });
      setShowPayOSModal(true);
      return;
    }

    setSwipeDirection(direction === 'super' ? 'right' : direction);

    if (direction === 'right' || direction === 'super') {
      try {
        const res = await likeUser(currentProfile.id);
        if (!isGoldActive) setDailyMatches(prev => prev + 1);
        
        if (res.matched) {
          setMatches(prev => prev + 1);
          setMatchedUser(currentProfile);
          setShowMatch(true);
          setTimeout(() => {
            setShowMatch(false);
            setShowChatModal(true);
          }, 3000);
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

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    toast({
      title: "Tin nhắn đã gửi! 💌",
      description: `Bạn đã gửi tin nhắn cho ${matchedUser?.name}`,
    });
    
    setChatMessage("");
    setShowChatModal(false);
    setMatchedUser(null);
  };

  const handleGoldUpgrade = () => {
    setIsGoldActive(true);
    toast({
      title: "Chào mừng thành viên GOLD! 👑",
      description: "Bạn đã có quyền truy cập không giới hạn!",
    });
  };

  const handleNearbyUpgrade = () => {
    setShowPayOSModal(true);
  };

  if (profilesLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50">
        <Card className="p-8 text-center bg-white/70 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang tải danh sách người dùng thật...</h2>
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
          <p className="text-gray-600">Hãy quay lại sau để gặp thêm người dùng thật</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Gold Member Badge */}
      {isGoldActive && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Crown className="w-4 h-4" />
          GOLD
        </div>
      )}

      {/* Daily Matches Counter */}
      {!isGoldActive && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
          {remainingMatches <= 3 && (
            <span className="text-red-500">⚠️ </span>
          )}
          {remainingMatches}/10 lượt còn lại
        </div>
      )}

      {/* Match Notification */}
      {showMatch && matchedUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/90 to-purple-500/90 backdrop-blur-sm">
          <div className="text-center text-white animate-pulse">
            <Heart className="w-20 h-20 mx-auto mb-4 text-red-300" />
            <h2 className="text-3xl font-bold mb-2">It's a Match! 💖</h2>
            <p className="text-lg">Bạn và {matchedUser.name} đã thích nhau!</p>
            <p className="text-sm mt-2 opacity-80">Sẽ mở cửa sổ chat trong giây lát...</p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="max-w-sm mx-auto h-full flex flex-col">
        <Card 
          className={`flex-1 relative overflow-hidden transition-all duration-300 ${
            swipeDirection === 'left' ? 'transform -translate-x-full rotate-12 opacity-0' :
            swipeDirection === 'right' ? 'transform translate-x-full -rotate-12 opacity-0' :
            'transform translate-x-0 rotate-0 opacity-100'
          }`}
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
              {currentProfile.distance ?? 0}km
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold">
                {currentProfile.name}, {currentProfile.age || 25}
              </h2>
              {currentProfile.job && (
                <p className="text-sm opacity-90">{currentProfile.job}</p>
              )}
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
            disabled={!isGoldActive && dailyMatches >= maxFreeMatches}
          >
            <Zap className="w-6 h-6 text-blue-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
            onClick={() => handleSwipe('right')}
            disabled={!isGoldActive && dailyMatches >= maxFreeMatches}
          >
            <Heart className="w-6 h-6 text-green-500" />
          </Button>
        </div>

        {/* Upgrade Banner */}
        {!isGoldActive && !goldLoading && (
          remainingMatches <= 3 && (
            <Card className="mt-4 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <div className="text-center">
                <Crown className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Nâng cấp GOLD</h3>
                <p className="text-sm opacity-90 mb-3">
                  Không giới hạn lượt match + nhiều tính năng khác
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="text-orange-600"
                  onClick={() => setShowPayOSModal(true)}
                >
                  Nâng cấp ngay - 99,000 VNĐ
                </Button>
              </div>
            </Card>
          )
        )}

        {/* Nearby Upgrade Banner */}
        {!isGoldActive && !nearbyLoading && (
          <NearbyFeatureBanner
            upgradeStatus={nearbyUpgrade?.status}
            nearbyLoading={nearbyLoading}
            hasExpandedRange={nearbyUpgrade?.status === "approved"}
            onClickUpgrade={handleNearbyUpgrade}
            onClickExpand={handleNearbyUpgrade}
            disableExpand={!!nearbyUpgrade && nearbyUpgrade.status === "approved"}
          />
        )}

        {/* Stats */}
        <div className="text-center text-sm text-gray-600 mt-2">
          {matches} matches • {availableProfiles.length - currentProfileIndex - 1} còn lại
        </div>
      </div>

      {/* Match Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-500" />
              Gửi tin nhắn cho {matchedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
              <img
                src={matchedUser?.avatar || "/placeholder.svg"}
                alt={matchedUser?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{matchedUser?.name}</h3>
                <p className="text-sm text-gray-600">Bạn đã match với nhau! 💖</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tin nhắn đầu tiên:</label>
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Chào bạn! Rất vui được match với bạn 😊"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowChatModal(false)}
                className="flex-1"
              >
                Để sau
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Gửi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PayOS Modal */}
      <PayOSModal
        isOpen={showPayOSModal}
        onClose={() => setShowPayOSModal(false)}
        onSuccess={
          nearbyUpgrade?.status !== "approved"
            ? () => setShowPayOSModal(false)
            : handleGoldUpgrade
        }
        packageType={
          (!nearbyUpgrade || (nearbyUpgrade.status && nearbyUpgrade.status !== "approved" && nearbyUpgrade.status !== "pending"))
            ? "nearby"
            : "gold"
        }
        packageName={
          (!nearbyUpgrade || (nearbyUpgrade.status && nearbyUpgrade.status !== "approved" && nearbyUpgrade.status !== "pending"))
            ? "Gói Mở Rộng Quanh đây"
            : "Gói GOLD"
        }
        price={
          (!nearbyUpgrade || (nearbyUpgrade.status && nearbyUpgrade.status !== "approved" && nearbyUpgrade.status !== "pending"))
            ? 49000
            : 99000
        }
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
