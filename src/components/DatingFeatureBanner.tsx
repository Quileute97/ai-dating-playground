
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Clock, AlertTriangle } from "lucide-react";
import { useIsDatingActive } from "@/hooks/useDatingSubscription";
import DatingPackageModal from "./DatingPackageModal";

interface DatingFeatureBannerProps {
  isDatingActive: boolean;
  datingLoading: boolean;
  onClickUpgrade: () => void;
  userId?: string;
  dailyMatches: number;
  maxFreeMatches: number;
}

const DatingFeatureBanner: React.FC<DatingFeatureBannerProps> = ({
  isDatingActive,
  datingLoading,
  onClickUpgrade,
  userId,
  dailyMatches,
  maxFreeMatches,
}) => {
  const { subscription, daysRemaining } = useIsDatingActive(userId);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  if (datingLoading) return null;
  
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
  
  // Show active subscription status
  if (isDatingActive && subscription) {
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
          
          <p className="text-xs opacity-80 mt-1">Không giới hạn lượt match</p>
        </div>
      </Card>
    );
  }

  // Show upgrade banner when running out of free matches
  const remainingMatches = maxFreeMatches - dailyMatches;
  if (!isDatingActive && remainingMatches <= 3) {
    return (
      <Card className="mt-4 p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <div className="text-center">
          <Crown className="w-8 h-8 mx-auto mb-1" />
          <h3 className="font-semibold mb-0.5">Nâng cấp Premium</h3>
          <p className="text-sm opacity-90 mb-1.5">
            Không giới hạn lượt match + nhiều tính năng khác
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-orange-600"
            onClick={onClickUpgrade}
          >
            Xem gói Premium
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <DatingPackageModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSelectPackage={async (packageId) => {
          try {
            const { createDatingPackagePayment } = await import("@/services/datingPackageService");
            setShowPremiumModal(false);
            
            const result = await createDatingPackagePayment(packageId, userId!, "user@example.com");
            
            if (result.checkoutUrl) {
              window.open(result.checkoutUrl, '_blank');
            } else {
              throw new Error("Không thể tạo liên kết thanh toán");
            }
          } catch (error) {
            console.error('Payment error:', error);
          }
        }}
      />
    </>
  );
};

export default DatingFeatureBanner;
