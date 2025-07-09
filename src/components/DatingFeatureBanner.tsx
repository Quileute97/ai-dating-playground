
import React from 'react';
import { Crown, Heart, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePremiumFeatureStatus } from '@/hooks/usePremiumFeatureStatus';

interface DatingFeatureBannerProps {
  isDatingActive: boolean;
  datingLoading: boolean;
  onClickUpgrade: () => void;
  userId?: string;
  dailyMatches: number;
  maxFreeMatches: number;
}

export default function DatingFeatureBanner({ 
  isDatingActive, 
  datingLoading, 
  onClickUpgrade, 
  userId,
  dailyMatches,
  maxFreeMatches
}: DatingFeatureBannerProps) {
  const { premiumDatingEnabled } = usePremiumFeatureStatus();

  // Don't show banner if premium dating is disabled by admin
  if (!premiumDatingEnabled) {
    return null;
  }

  if (datingLoading || isDatingActive) return null;

  const remainingMatches = Math.max(0, maxFreeMatches - dailyMatches);
  const isLowMatches = remainingMatches <= 3;

  return (
    <Card className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-500" />
            <Heart className="w-4 h-4 text-red-500 absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h3 className="font-bold text-gray-800 mb-2">
          {isLowMatches ? '⚠️ Sắp hết lượt match!' : 'Nâng cấp Premium'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3">
          {isLowMatches 
            ? `Chỉ còn ${remainingMatches} lượt match miễn phí!`
            : 'Không giới hạn lượt match & nhiều tính năng đặc biệt'
          }
        </p>

        <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Super Like</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>Vô hạn Like</span>
          </div>
          <div className="flex items-center gap-1">
            <Crown className="w-3 h-3" />
            <span>Boost Profile</span>
          </div>
        </div>

        <Button
          onClick={onClickUpgrade}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="sm"
        >
          <Crown className="w-4 h-4 mr-2" />
          Nâng cấp Premium
        </Button>
      </div>
    </Card>
  );
}
