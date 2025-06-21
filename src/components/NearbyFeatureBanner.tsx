
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface NearbyFeatureBannerProps {
  upgradeStatus: string | undefined;
  nearbyLoading: boolean;
  hasExpandedRange: boolean;
  onClickUpgrade: () => void;
  onClickExpand: () => void;
  disableExpand: boolean;
}

const NearbyFeatureBanner: React.FC<NearbyFeatureBannerProps> = ({
  upgradeStatus,
  nearbyLoading,
  hasExpandedRange,
  onClickUpgrade,
  onClickExpand,
  disableExpand,
}) => {
  if (nearbyLoading) return null;
  
  // Chỉ hiển thị banner nâng cấp khi chưa có upgrade hoặc bị reject
  if (!upgradeStatus || upgradeStatus === "rejected") {
    return (
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
            onClick={onClickUpgrade}
          >
            Nâng cấp ngay - 49,000 VNĐ
          </Button>
        </div>
      </Card>
    );
  }

  // Khi đã approved - chỉ hiển thị nút mở rộng
  if (upgradeStatus === "approved") {
    return (
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
            onClick={onClickExpand}
            disabled={disableExpand}
          >
            {disableExpand ? "Đã mở rộng" : "Mở rộng phạm vi"}
          </Button>
        </div>
      </Card>
    );
  }

  return null;
};

export default NearbyFeatureBanner;
