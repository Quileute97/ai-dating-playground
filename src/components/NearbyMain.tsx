
import React from "react";
import NearbyUserList from "./NearbyUserList";
import NearbyFeatureBanner from "./NearbyFeatureBanner";
import PayOSModal from "./PayOSModal";

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

interface BankInfoType {
  bankName?: string;
  [key: string]: any;
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
  bankInfo: BankInfoType | undefined;
  onViewProfile: (u: NearbyUser) => void;
  onLikeUser: (userId: string, e?: React.MouseEvent) => void;
  onMessageUser: (userId: string, e?: React.MouseEvent) => void;
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
  onMessageUser
}) => {
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
          onClickUpgrade={() => setShowPayOSModal(true)}
          onClickExpand={onExpandRange}
          disableExpand={disableExpand}
        />
      </div>
      <PayOSModal
        isOpen={showPayOSModal}
        onClose={() => setShowPayOSModal(false)}
        onSuccess={() => setShowPayOSModal(false)}
        packageType="nearby"
        packageName="Mở rộng phạm vi"
        price={49000}
        bankInfo={bankInfo}
      />
    </div>
  );
};

export default NearbyMain;
