
import React from 'react';
import { Crown, Users, MessageCircle, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePremiumFeatureStatus } from '@/hooks/usePremiumFeatureStatus';

interface NearbyFeatureBannerProps {
  upgradeStatus?: string;
  nearbyLoading: boolean;
  hasExpandedRange: boolean;
  onClickUpgrade: () => void;
  onClickExpand: () => void;
  disableExpand: boolean;
  userId?: string;
}

export default function NearbyFeatureBanner({ 
  upgradeStatus,
  nearbyLoading, 
  hasExpandedRange,
  onClickUpgrade,
  onClickExpand,
  disableExpand,
  userId 
}: NearbyFeatureBannerProps) {
  const { premiumNearbyEnabled } = usePremiumFeatureStatus();

  // Don't show banner if premium nearby is disabled by admin
  if (!premiumNearbyEnabled) {
    return null;
  }

  if (nearbyLoading) return null;

  // If user has active nearby subscription, don't show upgrade banner
  const isNearbyActive = upgradeStatus === 'approved';
  if (isNearbyActive) return null;

  // Show expand range option if not expanded yet
  if (!hasExpandedRange && !disableExpand) {
    return (
      <Card className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <MapPin className="w-8 h-8 text-green-500" />
          </div>
          
          <h3 className="font-bold text-gray-800 mb-2">Mở rộng phạm vi tìm kiếm</h3>
          
          <p className="text-sm text-gray-600 mb-3">
            Tăng phạm vi từ 5km lên 20km để tìm thêm nhiều người
          </p>

          <Button
            onClick={onClickExpand}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            size="sm"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Mở rộng phạm vi
          </Button>
        </div>
      </Card>
    );
  }

  // Show premium upgrade banner
  return (
    <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-500" />
            <MapPin className="w-4 h-4 text-blue-500 absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h3 className="font-bold text-gray-800 mb-2">Nâng cấp Premium Quanh Đây</h3>
        
        <p className="text-sm text-gray-600 mb-3">
          Xem người dùng quanh đây & chat không giới hạn
        </p>

        <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Xem Quanh Đây</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>Chat Vô Hạn</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>Vị Trí Chính Xác</span>
          </div>
        </div>

        <Button
          onClick={onClickUpgrade}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          size="sm"
        >
          <Crown className="w-4 h-4 mr-2" />
          Nâng cấp Premium
        </Button>
      </div>
    </Card>
  );
}
