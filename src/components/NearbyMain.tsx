import React, { useState } from "react";
import NearbyUserList from "./NearbyUserList";
import NearbyFeatureBanner from "./NearbyFeatureBanner";
import NearbyPackageModal from "./NearbyPackageModal";
import { createNearbyPackagePayment } from "@/services/payosService";
import { useToast } from "@/hooks/use-toast";

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

interface NearbyMainProps {
  users: NearbyUser[];
  userLocation: { lat: number; lng: number } | null;
  hasExpandedRange: boolean;
  setShowPayOSModal: (v: boolean) => void;
  showPayOSModal: boolean;
  upgradeStatus: string | undefined;
  nearbyLoading: boolean;
  onExpandRange: () => void;
  disableExpand: boolean;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrUrl: string;
  } | undefined;
  onViewProfile: (u: NearbyUser) => void;
  onLikeUser: (userId: string, e?: React.MouseEvent) => void;
  onMessageUser: (userId: string, e?: React.MouseEvent) => void;
  currentUser?: any; // Thêm prop currentUser
}

const NearbyMain: React.FC<NearbyMainProps> = ({
  users,
  userLocation,
  hasExpandedRange,
  setShowPayOSModal,
  showPayOSModal,
  upgradeStatus,
  nearbyLoading,
  onExpandRange,
  disableExpand,
  bankInfo,
  onViewProfile,
  onLikeUser,
  onMessageUser,
  currentUser
}) => {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const { toast } = useToast();

  const handleSelectPackage = async (packageId: string) => {
    if (!currentUser?.id) {
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
        currentUser.id,
        currentUser.email
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

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <NearbyUserList
          users={users}
          userLocation={userLocation}
          hasExpandedRange={hasExpandedRange}
          upgradeStatus={upgradeStatus}
          onViewProfile={onViewProfile}
          onLikeUser={onLikeUser}
          onMessageUser={onMessageUser}
        />
        <NearbyFeatureBanner
          upgradeStatus={upgradeStatus}
          nearbyLoading={nearbyLoading}
          hasExpandedRange={hasExpandedRange}
          onClickUpgrade={() => {
            // Navigate to payment page for nearby
            window.location.href = '/payment?type=nearby&package=nearby_week';
          }}
          onClickExpand={onExpandRange}
          disableExpand={disableExpand}
          userId={currentUser?.id}
        />
      </div>

      <NearbyPackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onSelectPackage={handleSelectPackage}
        currentUser={currentUser}
      />
    </div>
  );
};

export default NearbyMain;
