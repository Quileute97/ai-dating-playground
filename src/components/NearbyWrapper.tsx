
import React, { useState } from "react";
import NearbyMain from "./NearbyMain";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useUpdateProfileLocation } from "@/hooks/useUpdateProfileLocation";
import { useBankInfo } from "@/hooks/useBankInfo";
import { useToast } from "@/hooks/use-toast";

interface NearbyWrapperProps {
  user?: any;
}

const NearbyWrapper: React.FC<NearbyWrapperProps> = ({ user }) => {
  const { position, loading: geoLoading } = useGeolocation();
  const [hasExpandedRange, setHasExpandedRange] = useState(false);
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const { toast } = useToast();

  // Update profile location when position changes
  useUpdateProfileLocation(user?.id, position);

  // Get nearby profiles
  const maxDistance = hasExpandedRange ? 20 : 5;
  const { profiles, loading: nearbyLoading } = useNearbyProfiles(user?.id, position, maxDistance);

  // Get bank info
  const { data: bankInfo } = useBankInfo();

  // Mock upgrade status - you might want to replace this with actual hook
  const upgradeStatus = undefined;

  // Convert profiles to the expected format
  const nearbyUsers = profiles.map(profile => ({
    id: profile.id,
    name: profile.name || "Unknown",
    age: profile.age || 25,
    distance: profile.distance || 0,
    avatar: profile.avatar || "/placeholder.svg",
    isOnline: true, // Mock data
    lastSeen: profile.last_active || new Date().toISOString(),
    interests: Array.isArray(profile.interests) ? profile.interests : [],
    rating: 4.5, // Mock data
    isLiked: false // Mock data
  }));

  const handleExpandRange = () => {
    if (!hasExpandedRange) {
      setHasExpandedRange(true);
      toast({
        title: "Phạm vi đã được mở rộng",
        description: "Bạn có thể xem người dùng trong bán kính 20km",
      });
    }
  };

  const handleViewProfile = (user: any) => {
    console.log("View profile:", user);
    // TODO: Implement profile viewing logic
  };

  const handleLikeUser = (userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log("Like user:", userId);
    // TODO: Implement like logic
  };

  const handleMessageUser = (userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log("Message user:", userId);
    // TODO: Implement messaging logic
  };

  return (
    <NearbyMain
      users={nearbyUsers}
      userLocation={position}
      hasExpandedRange={hasExpandedRange}
      setShowPayOSModal={setShowPayOSModal}
      showPayOSModal={showPayOSModal}
      upgradeStatus={upgradeStatus}
      nearbyLoading={nearbyLoading || geoLoading}
      onExpandRange={handleExpandRange}
      disableExpand={hasExpandedRange}
      bankInfo={bankInfo}
      onViewProfile={handleViewProfile}
      onLikeUser={handleLikeUser}
      onMessageUser={handleMessageUser}
      currentUser={user}
    />
  );
};

export default NearbyWrapper;
