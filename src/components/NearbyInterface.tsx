import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import NearbyChatWindow from './NearbyChatWindow';
import { useBankInfo } from "@/hooks/useBankInfo";
import { useUpgradeStatus } from './hooks/useUpgradeStatus';
import NearbyProfileView from "./NearbyProfileView";
import NearbyMain from "./NearbyMain";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react"; // Only allow: arrow-left, map-pin, message-circle, heart

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
  const [locationPermission, setLocationPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>(mockNearbyUsers);
  const [hasExpandedRange, setHasExpandedRange] = useState(false);
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const { toast } = useToast();
  const bankInfoHook = useBankInfo();
  const { data: nearbyUpgrade, isLoading: nearbyLoading } = useUpgradeStatus(user?.id, "nearby");
  const upgradeStatus = nearbyUpgrade?.status;

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
    if (!hasExpandedRange) {
      setHasExpandedRange(true);
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

  const handleViewProfile = (user: NearbyUser) => setSelectedUser(user);
  const handleCloseProfile = () => setSelectedUser(null);

  const handleLikeUser = (userId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    const updatedUsers = nearbyUsers.map((u) =>
      u.id === userId ? { ...u, isLiked: !u.isLiked } : u
    );
    setNearbyUsers(updatedUsers);
    const user = updatedUsers.find((u) => u.id === userId);
    if (user) {
      toast({
        title: user.isLiked ? "Đã thích!" : "Đã bỏ thích!",
        description: user.isLiked ? `Bạn đã thích ${user.name}` : `Bạn đã bỏ thích ${user.name}`,
      });
      if (user.isLiked && Math.random() > 0.5) {
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
    if (event) event.stopPropagation();
    const foundUser = nearbyUsers.find((u) => u.id === userId);
    if (foundUser) {
      setSelectedUser(null);
      setChatUser(foundUser);
    }
  };

  const handleCloseChat = () => setChatUser(null);

  if (locationPermission === "pending") {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white animate-pulse" />
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
  if (locationPermission === "denied") {
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
      <NearbyProfileView
        user={selectedUser}
        onClose={handleCloseProfile}
        onLike={handleLikeUser}
        onMessage={handleMessageUser}
      />
    );
  }
  if (chatUser) {
    return <NearbyChatWindow user={chatUser} onClose={handleCloseChat} />;
  }

  // Only pass bankInfo if all required fields are present
  const fullBankInfo = (!bankInfoHook.loading && bankInfoHook.bankInfo.bankName && bankInfoHook.bankInfo.accountNumber && bankInfoHook.bankInfo.accountHolder && bankInfoHook.bankInfo.qrUrl)
    ? bankInfoHook.bankInfo
    : undefined;

  return (
    <NearbyMain
      users={nearbyUsers}
      userLocation={userLocation}
      hasExpandedRange={hasExpandedRange}
      setShowPayOSModal={setShowPayOSModal}
      showPayOSModal={showPayOSModal}
      upgradeStatus={upgradeStatus}
      nearbyLoading={nearbyLoading}
      onExpandRange={handleExpandRange}
      disableExpand={hasExpandedRange}
      bankInfo={fullBankInfo}
      onViewProfile={handleViewProfile}
      onLikeUser={handleLikeUser}
      onMessageUser={handleMessageUser}
    />
  );
};

export default NearbyInterface;
