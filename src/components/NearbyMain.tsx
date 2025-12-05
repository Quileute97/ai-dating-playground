import React, { useState } from "react";
import NearbyUserList from "./NearbyUserList";
import NearbyFeatureBanner from "./NearbyFeatureBanner";
import NearbyPackageModal from "./NearbyPackageModal";

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
            // Show package modal instead of navigating to payment page
            setShowPackageModal(true);
          }}
          onClickExpand={onExpandRange}
          disableExpand={disableExpand}
          userId={currentUser?.id}
        />
      </div>

      <NearbyPackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default NearbyMain;
