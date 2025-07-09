
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

interface PremiumButtonProps {
  userId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const PremiumButton = ({ 
  userId, 
  variant = 'default', 
  size = 'default',
  className = '' 
}: PremiumButtonProps) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { data: premiumStatus, isLoading } = usePremiumStatus(userId);

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Crown className="w-4 h-4 mr-2" />
        Đang tải...
      </Button>
    );
  }

  if (premiumStatus?.isPremium) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
        {premiumStatus.daysRemaining && (
          <span className="text-xs text-gray-500">
            {premiumStatus.daysRemaining} ngày
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowUpgradeModal(true)}
        className={`bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 ${className}`}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Nâng cấp Premium
      </Button>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={userId}
      />
    </>
  );
};

export default PremiumButton;
