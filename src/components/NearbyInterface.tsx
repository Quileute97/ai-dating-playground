import React, { useState, useEffect } from 'react';
import { MapPin, Heart, MessageCircle, Star, Navigation, ArrowLeft, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import PayOSModal from './PayOSModal';
import NearbyChatWindow from './NearbyChatWindow';
import { useBankInfo } from "@/hooks/useBankInfo";
import { useUpgradeStatus } from './hooks/useUpgradeStatus';

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

interface NearbyInterfaceProps {
  user?: any;
}

const mockNearbyUsers: NearbyUser[] = [
  {
    id: '1',
    name: 'Lan Anh',
    age: 24,
    distance: 0.8,
    avatar: '/placeholder.svg',
    isOnline: true,
    lastSeen: 'Đang online',
    interests: ['Yoga', 'Cafe'],
    rating: 4.8,
    isLiked: false
  },
  {
    id: '2',
    name: 'Minh Đức',
    age: 26,
    distance: 1.2,
    avatar: '/placeholder.svg',
    isOnline: false,
    lastSeen: '5 phút trước',
    interests: ['Gaming', 'Công nghệ'],
    rating: 4.5,
    isLiked: false
  },
  {
    id: '3',
    name: 'Thu Trang',
    age: 23,
    distance: 2.1,
    avatar: '/placeholder.svg',
    isOnline: true,
    lastSeen: 'Đang online',
    interests: ['Du lịch', 'Nhiếp ảnh'],
    rating: 4.9,
    isLiked: false
  },
  {
    id: '4',
    name: 'Hoàng Việt',
    age: 28,
    distance: 3.5,
    avatar: '/placeholder.svg',
    isOnline: false,
    lastSeen: '1 giờ trước',
    interests: ['Thể thao', 'Âm nhạc'],
    rating: 4.3,
    isLiked: false
  },
  {
    id: '5',
    name: 'Mai Linh',
    age: 22,
    distance: 4.8,
    avatar: '/placeholder.svg',
    isOnline: true,
    lastSeen: 'Đang online',
    interests: ['Sách', 'Phim'],
    rating: 4.7,
    isLiked: false
  }
];

const NearbyInterface = ({ user }: NearbyInterfaceProps) => {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [chatUser, setChatUser] = useState<NearbyUser | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>(mockNearbyUsers);
  const [hasExpandedRange, setHasExpandedRange] = useState(false);
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const { toast } = useToast();
  const bankInfoHook = useBankInfo();
  const { data: nearbyUpgrade, isLoading: nearbyLoading } = useUpgradeStatus(user?.id, 'nearby');
  const upgradeStatus = nearbyUpgrade?.status; // approved | pending | rejected | undefined

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setLocationPermission('granted');
      console.log('GPS location granted:', position.coords);
    } catch (error) {
      console.error('GPS permission denied:', error);
      setLocationPermission('denied');
    }
  };

  const handleExpandRange = () => {
    // Chỉ được phép mở rộng khi đã approved
    if (upgradeStatus !== "approved") {
      toast({
        variant: "destructive",
        title: "Không thể mở rộng phạm vi",
        description:
          upgradeStatus === "pending"
            ? "Yêu cầu nâng cấp của bạn đang chờ duyệt. Vui lòng đợi admin xác nhận trước khi sử dụng tính năng nâng cao."
            : "Bạn cần nâng cấp để sử dụng tính năng mở rộng phạm vi.",
      });
      return;
    }

    // Tính năng mở rộng phạm vi chỉ chạy khi đã được approved
    if (!hasExpandedRange) {
      setHasExpandedRange(true);
      // Simulate load more users trong phạm vi 20km (nếu chưa có)
      const extendedUsers = [
        ...nearbyUsers,
        {
          id: '6',
          name: 'Phương Anh',
          age: 25,
          distance: 8.2,
          avatar: '/placeholder.svg',
          isOnline: true,
          lastSeen: 'Đang online',
          interests: ['Thời trang', 'Làm đẹp'],
          rating: 4.6,
          isLiked: false
        },
        {
          id: '7',
          name: 'Tuấn Minh',
          age: 27,
          distance: 12.5,
          avatar: '/placeholder.svg',
          isOnline: false,
          lastSeen: '2 giờ trước',
          interests: ['Kinh doanh', 'Đầu tư'],
          rating: 4.4,
          isLiked: false
        }
      ];
      setNearbyUsers(extendedUsers);

      toast({
        title: "Đã mở rộng phạm vi! 🎉",
        description: "Tìm thấy thêm nhiều người trong phạm vi 20km",
      });
    }
  };

  const handleViewProfile = (user: NearbyUser) => {
    setSelectedUser(user);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
  };

  const handleLikeUser = (userId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    const updatedUsers = nearbyUsers.map(u => 
      u.id === userId ? { ...u, isLiked: !u.isLiked } : u
    );
    setNearbyUsers(updatedUsers);

    const user = updatedUsers.find(u => u.id === userId);
    if (user) {
      toast({
        title: user.isLiked ? "Đã thích!" : "Đã bỏ thích!",
        description: user.isLiked 
          ? `Bạn đã thích ${user.name}` 
          : `Bạn đã bỏ thích ${user.name}`,
      });
      
      if (user.isLiked && Math.random() > 0.5) {
        // Simulate match sometimes
        setTimeout(() => {
          toast({
            title: "🎉 Có match mới!",
            description: `${user.name} cũng đã thích bạn! Hãy bắt đầu trò chuyện.`,
          });
        }, 1000);
      }
    }

    console.log('Like user:', userId);
  };

  const handleMessageUser = (userId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    const user = nearbyUsers.find(u => u.id === userId);
    if (user) {
      // Close profile view if open and open chat
      setSelectedUser(null);
      setChatUser(user);
      console.log('Opening chat with user:', userId);
    }
  };

  const handleCloseChat = () => {
    setChatUser(null);
  };

  // Show GPS permission request screen
  if (locationPermission === 'pending') {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Đang yêu cầu truy cập GPS</h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi cần truy cập vị trí của bạn để tìm những người xung quanh
          </p>
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </Card>
      </div>
    );
  }

  // Show GPS denied screen
  if (locationPermission === 'denied') {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Cần quyền truy cập vị trí</h3>
          <p className="text-gray-600 mb-4">
            Để sử dụng tính năng "Quanh đây", vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt
          </p>
          <Button 
            onClick={requestLocationPermission}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-md mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCloseProfile}
              className="rounded-full p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Hồ sơ cá nhân</h1>
          </div>

          {/* Scrollable Profile Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <Card className="overflow-hidden mb-4">
                <div className="relative h-64">
                  <img 
                    src={selectedUser.avatar} 
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Online Status */}
                  {selectedUser.isOnline && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Online
                    </div>
                  )}

                  {/* Name and Age */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-2xl font-bold">
                      {selectedUser.name}, {selectedUser.age}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedUser.distance}km từ bạn</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-medium">{selectedUser.rating}</span>
                    <span className="text-gray-500 text-sm">({Math.floor(Math.random() * 50) + 10} đánh giá)</span>
                  </div>

                  {/* Last Seen */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Hoạt động: {selectedUser.lastSeen}
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Sở thích</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Additional Profile Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="font-medium mb-2">Giới thiệu</h3>
                      <p className="text-gray-600 text-sm">
                        Xin chào! Tôi là {selectedUser.name}, rất vui được gặp bạn. 
                        Tôi thích {selectedUser.interests.join(', ').toLowerCase()} và luôn sẵn sàng khám phá những điều mới mẻ.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Tìm kiếm</h3>
                      <p className="text-gray-600 text-sm">
                        Tìm kiếm những mối quan hệ chân thành và có ý nghĩa. 
                        Hy vọng có thể gặp được người phù hợp để cùng chia sẻ những trải nghiệm thú vị.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      className={`flex-1 transition-all duration-200 ${
                        selectedUser.isLiked
                          ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 shadow-lg'
                          : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                      }`}
                      onClick={() => handleLikeUser(selectedUser.id)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${selectedUser.isLiked ? 'fill-current' : ''}`} />
                      {selectedUser.isLiked ? 'Đã thích' : 'Thích'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => handleMessageUser(selectedUser.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Nhắn tin
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  if (chatUser) {
    return <NearbyChatWindow user={chatUser} onClose={handleCloseChat} />;
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
            {hasExpandedRange && upgradeStatus === "approved" && (
              <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Mở rộng
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {nearbyUsers.length} người trong phạm vi {hasExpandedRange && upgradeStatus === "approved" ? '20km' : '5km'}
          </p>
        </div>

        {/* Users List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pb-4">
            {nearbyUsers.map((user) => (
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
                      {user.interests.slice(0, 2).map((interest, index) => (
                        <span 
                          key={index}
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
                          ? 'border-pink-300 bg-pink-50 hover:bg-pink-100' 
                          : 'hover:border-pink-300 hover:bg-pink-50'
                      }`}
                      onClick={(e) => handleLikeUser(user.id, e)}
                    >
                      <Heart className={`w-4 h-4 text-pink-500 ${user.isLiked ? 'fill-current' : ''}`} />
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

        {/* Banner và nút mở rộng chỉ khi cần */}
        {/* Nếu chưa có upgrade hoặc bị reject => hiện banner nâng cấp */}
        {(!upgradeStatus || upgradeStatus === "rejected") && !nearbyLoading && (
          <Card className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="text-center">
              <h3 className="font-semibold mb-1">Mở rộng phạm vi tìm kiếm</h3>
              <p className="text-sm opacity-90 mb-3">
                Nâng cấp để tìm kiếm trong phạm vi 20km
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-purple-600"
                onClick={() => setShowPayOSModal(true)}
              >
                Nâng cấp ngay - 49,000 VNĐ
              </Button>
            </div>
          </Card>
        )}
        {/* Nếu đã gửi yêu cầu nâng cấp (pending) => hiện banner chờ duyệt, KHÔNG render nút mở rộng phạm vi */}
        {upgradeStatus === "pending" && !nearbyLoading && (
          <Card className="mt-4 p-4 bg-gradient-to-r from-yellow-500 to-orange-400 text-white">
            <div className="text-center">
              <Crown className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Yêu cầu mở rộng phạm vi đang chờ duyệt</h3>
              <p className="text-sm opacity-90 mb-2">
                Vui lòng chờ admin kiểm tra thanh toán. Khi duyệt xong, bạn sẽ tìm được nhiều người mới hơn!
              </p>
            </div>
          </Card>
        )}
        {/* Nếu đã được approved thì có thể cho biết status, đồng thời enable nút mở rộng */}
        {upgradeStatus === "approved" && !nearbyLoading && (
          <Card className="mt-4 p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <div className="text-center">
              <Crown className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Phạm vi đã mở rộng!</h3>
              <p className="text-sm opacity-90">
                Bạn có thể tìm kiếm trong phạm vi 20km
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-3 text-green-700"
                onClick={handleExpandRange}
                disabled={hasExpandedRange}
              >
                {hasExpandedRange ? "Đã mở rộng" : "Mở rộng phạm vi"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* PayOS Modal */}
      <PayOSModal
        isOpen={showPayOSModal}
        onClose={() => setShowPayOSModal(false)}
        onSuccess={() => {
          // Khi thanh toán thành công chỉ set modal đóng, trạng thái "pending" sẽ load từ useUpgradeStatus ở lần render tiếp theo.
          setShowPayOSModal(false);
        }}
        packageType="nearby"
        packageName="Mở rộng phạm vi"
        price={49000}
        bankInfo={
          !bankInfoHook.loading && bankInfoHook.bankInfo.bankName 
          ? bankInfoHook.bankInfo 
          : undefined
        }
      />
    </div>
  );
};

export default NearbyInterface;

// Lưu ý: File này khá dài (~582 dòng). Bạn nên cân nhắc refactor thành các component nhỏ để code dễ bảo trì hơn!
