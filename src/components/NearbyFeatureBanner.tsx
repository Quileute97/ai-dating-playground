
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Clock, AlertTriangle } from "lucide-react";
import { useIsNearbyActive } from "@/hooks/useNearbySubscription";

interface NearbyFeatureBannerProps {
  upgradeStatus: string | undefined;
  nearbyLoading: boolean;
  hasExpandedRange: boolean;
  onClickUpgrade: () => void;
  onClickExpand: () => void;
  disableExpand: boolean;
  userId?: string;
}

const NearbyFeatureBanner: React.FC<NearbyFeatureBannerProps> = ({
  upgradeStatus,
  nearbyLoading,
  hasExpandedRange,
  onClickUpgrade,
  onClickExpand,
  disableExpand,
  userId,
}) => {
  const { isActive, daysRemaining, subscription } = useIsNearbyActive(userId);

  if (nearbyLoading) return null;
  
  // Show expired subscription banner
  if (subscription && subscription.status === 'expired') {
    return (
      <Card className="mt-4 p-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-1" />
          <h3 className="font-semibold mb-0.5">Gói Premium đã hết hạn</h3>
          <p className="text-sm opacity-90 mb-1.5">
            Gia hạn ngay để tiếp tục sử dụng tính năng Premium
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="text-red-600"
            onClick={onClickUpgrade}
          >
            Gia hạn Premium
          </Button>
        </div>
      </Card>
    );
  }
  
  // Show package selection banner if no active subscription
  if (!isActive) {
    return (
      <Card className="mt-4 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="text-center">
          <Crown className="w-8 h-8 mx-auto mb-1" />
          <h3 className="font-semibold mb-0.5">Mở rộng phạm vi tìm kiếm</h3>
          <p className="text-sm opacity-90 mb-1.5">
            Chọn gói Premium để tìm kiếm trong phạm vi 20km
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="text-purple-600"
            onClick={onClickUpgrade}
          >
            Chọn Gói Premium
          </Button>
        </div>
      </Card>
    );
  }

  // Show active subscription status
  return (
    <Card className="mt-4 p-2 bg-gradient-to-r from-green-500 to-blue-500 text-white">
      <div className="text-center">
        <Crown className="w-8 h-8 mx-auto mb-1" />
        <h3 className="font-semibold mb-0.5">Premium đã kích hoạt!</h3>
        
        {subscription?.duration_days === -1 ? (
          <p className="text-sm opacity-90">Gói Vô Hạn - Không giới hạn thời gian</p>
        ) : daysRemaining !== null ? (
          <div className="flex items-center justify-center gap-1 text-sm opacity-90">
            <Clock className="w-4 h-4" />
            <span>Còn {daysRemaining} ngày</span>
          </div>
        ) : null}
        
        <Button
          variant="secondary"
          size="sm"
          className="mt-1.5 text-green-700"
          onClick={onClickExpand}
          disabled={disableExpand}
        >
          {disableExpand ? "Đã mở rộng" : "Mở rộng phạm vi"}
        </Button>
      </div>
    </Card>
  );
};

export default NearbyFeatureBanner;
