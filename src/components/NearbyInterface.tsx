
import React, { useState, useEffect } from "react";
import { MapPin, Heart, MessageCircle, Star, Crown, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useChatIntegration } from '@/hooks/useChatIntegration';
import NearbyFeatureBanner from "./NearbyFeatureBanner";
import NearbyPackageModal from "./NearbyPackageModal";
import { createNearbyPackagePayment } from "@/services/payosService";

interface NearbyInterfaceProps {
  user: any;
}

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  distance: number;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  interests: string[];
  rating: number;
  isLiked?: boolean;
}

const NearbyInterface = ({ user }: NearbyInterfaceProps) => {
  const [distance, setDistance] = useState(5);
  const [hasExpandedRange, setHasExpandedRange] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startChatWith } = useChatIntegration();
  
  // Get user location
  const { position: userLocation } = useGeolocation();
  
  // Use the hook with correct parameters
  const { profiles, loading } = useNearbyProfiles(user?.id, userLocation, distance);

  // Transform profiles to match NearbyUser interface
  const users: NearbyUser[] = profiles.map(profile => ({
    id: profile.id,
    name: profile.name || "Unknown",
    age: profile.age || 25,
    distance: profile.distance || 0,
    avatar: profile.avatar || "/placeholder.svg",
    isOnline: profile.last_active ? new Date(profile.last_active) > new Date(Date.now() - 5 * 60 * 1000) : false,
    lastSeen: profile.last_active ? "Vừa online" : "Offline",
    interests: Array.isArray(profile.interests) ? profile.interests : [],
    rating: 4.5,
    isLiked: likedUsers.has(profile.id)
  }));

  const handleViewProfile = (profile: NearbyUser) => {
    navigate(`/profile/${profile.id}`);
  };

  const handleLikeUser = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setLikedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });

    const user = users.find(u => u.id === userId);
    toast({
      title: likedUsers.has(userId) ? "Đã bỏ thích" : "❤️ Đã thích",
      description: user ? `${user.name}` : "Người dùng",
    });
  };

  const handleMessageUser = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      // Use unified chat system instead of just showing toast
      startChatWith({
        id: targetUser.id,
        name: targetUser.name,
        avatar: targetUser.avatar
      });
    }
  };

  const handleExpandRange = () => {
    setHasExpandedRange(true);
    setDistance(20);
    toast({
      title: "Đã mở rộng phạm vi",
      description: "Tìm kiếm trong phạm vi 20km",
    });
  };

  const handleSelectPackage = async (packageId: string) => {
    if (!user?.id) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua gói Premium",
        variant: "destructive"
      });
      return;
    }

    setShowPackageModal(false);
    
    try {
      const result = await createNearbyPackagePayment(
        packageId,
        user.id,
        user.email
      );

      if (result.error === 0 && result.data?.checkoutUrl) {
        window.open(result.data.checkoutUrl, '_blank');
        toast({
          title: "Chuyển hướng thanh toán",
          description: "Vui lòng hoàn tất thanh toán để kích hoạt gói Premium",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi tạo thanh toán",
        description: "Không thể tạo liên kết thanh toán. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-gray-800">Quanh đây</h1>
            {userLocation && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                GPS
              </div>
            )}
            {hasExpandedRange && (
              <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Mở rộng
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {users.length} người trong phạm vi {hasExpandedRange ? "20km" : "5km"}
          </p>
        </div>

        {/* Users List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pb-4">
            {users.map((user) => (
              <Card
                key={user.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                onClick={() => handleViewProfile(user)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {user.isOnline && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {user.name}, {user.age}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{user.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{user.distance}km</span>
                      <span>•</span>
                      <span>{user.lastSeen}</span>
                    </div>
                    <div className="flex gap-1">
                      {user.interests.slice(0, 2).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                      {user.interests.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                          +{user.interests.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Quick Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`w-8 h-8 p-0 rounded-full transition-all duration-200 ${
                        user.isLiked
                          ? "border-pink-300 bg-pink-50 hover:bg-pink-100"
                          : "hover:border-pink-300 hover:bg-pink-50"
                      }`}
                      onClick={(e) => handleLikeUser(user.id, e)}
                    >
                      <Heart className={`w-4 h-4 text-pink-500 ${user.isLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0 rounded-full hover:border-blue-300 hover:bg-blue-50"
                      onClick={(e) => handleMessageUser(user.id, e)}
                    >
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Feature Banner */}
        <NearbyFeatureBanner
          upgradeStatus={undefined}
          nearbyLoading={loading}
          hasExpandedRange={hasExpandedRange}
          onClickUpgrade={() => {
            // Navigate to payment page for nearby
            window.location.href = '/payment?type=nearby&package=nearby_week';
          }}
          onClickExpand={handleExpandRange}
          disableExpand={hasExpandedRange}
          userId={user?.id}
        />
      </div>

      {/* Package Modal */}
      <NearbyPackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onSelectPackage={handleSelectPackage}
        currentUser={user}
      />
    </div>
  );
};

export default NearbyInterface;
