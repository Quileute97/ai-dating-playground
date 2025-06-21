import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import NearbyChatWindow from './NearbyChatWindow';
import { useBankInfo } from "@/hooks/useBankInfo";
import { useUpgradeStatus } from './hooks/useUpgradeStatus';
import NearbyProfileView from "./NearbyProfileView";
import NearbyMain from "./NearbyMain";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useUpdateProfileLocation } from "@/hooks/useUpdateProfileLocation";

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
  bio?: string;
  height?: number;
  job?: string;
  education?: string;
  location_name?: string;
}

interface NearbyInterfaceProps {
  user?: any;
}

const NearbyInterface = ({ user }: NearbyInterfaceProps) => {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [chatUser, setChatUser] = useState<NearbyUser | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [hasExpandedRange, setHasExpandedRange] = useState(false);
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const { toast } = useToast();
  const bankInfoHook = useBankInfo();
  const { data: nearbyUpgrade, isLoading: nearbyLoading } = useUpgradeStatus(user?.id, "nearby");
  const upgradeStatus = nearbyUpgrade?.status;

  // Function to request location access and update state
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Thiết bị không hỗ trợ GPS",
        description: "Trình duyệt của bạn không hỗ trợ lấy vị trí.",
      });
      setLocationPermission("denied");
      return;
    }
    setLocationPermission("pending");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission("granted");
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setLocationPermission("denied");
        toast({
          variant: "destructive",
          title: "Không thể lấy vị trí",
          description: "Bạn cần cho phép truy cập vị trí để sử dụng tính năng này.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // Bước 1: Lấy vị trí & cập nhật lên profiles
  useEffect(() => {
    requestLocationPermission();
  }, []);

  useUpdateProfileLocation(user?.id, userLocation);

  // Lấy danh sách user quanh đây thật từ Supabase
  const searchRadius = hasExpandedRange && upgradeStatus === "approved" ? 20 : 5;
  const { profiles, loading: profilesLoading } = useNearbyProfiles(user?.id, userLocation, searchRadius);

  // Chuyển đổi profile từ database thành NearbyUser
  function profileToNearbyUser(profile: any): NearbyUser {
    const interests = Array.isArray(profile.interests) ? profile.interests : [];
    const isRecentlyActive = profile.last_active ? 
      (new Date().getTime() - new Date(profile.last_active).getTime()) < 30 * 60 * 1000 : false; // 30 phút

    return {
      id: profile.id,
      name: profile.name || "Chưa đặt tên",
      age: profile.age || 18,
      distance: Math.round((profile.distance || 0) * 10) / 10,
      avatar: profile.avatar || "/placeholder.svg",
      isOnline: isRecentlyActive,
      lastSeen: profile.last_active ? 
        (isRecentlyActive ? "Đang online" : `${Math.floor((new Date().getTime() - new Date(profile.last_active).getTime()) / (1000 * 60))} phút trước`) 
        : "Chưa rõ",
      interests: interests.length > 0 ? interests : ["Đang cập nhật"],
      rating: 4.0 + Math.random() * 1.0, // Tạm thời random, sau có thể thêm rating thật
      isLiked: false,
      bio: profile.bio,
      height: profile.height,
      job: profile.job,
      education: profile.education,
      location_name: profile.location_name
    };
  }

  const nearbyUsers: NearbyUser[] = React.useMemo(() =>
    profiles.map(profileToNearbyUser), [profiles]
  );

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
    // TODO: dùng Supabase cho like thật
    toast({
      title: "Đã thích!",
      description: `Bạn đã thích người dùng này`,
    });
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
    return <NearbyChatWindow user={chatUser} currentUserId={user?.id} onClose={handleCloseChat} />;
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
      nearbyLoading={nearbyLoading || profilesLoading}
      onExpandRange={handleExpandRange}
      disableExpand={hasExpandedRange}
      bankInfo={fullBankInfo}
      onViewProfile={handleViewProfile}
      onLikeUser={handleLikeUser}
      onMessageUser={handleMessageUser}
      currentUser={user}
    />
  );
};

export default NearbyInterface;
