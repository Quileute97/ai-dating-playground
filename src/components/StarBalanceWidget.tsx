import React, { useState } from 'react';
import { Star, Plus, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarPurchaseModal from './StarPurchaseModal';
import { useStars } from '@/hooks/useStars';

interface StarBalanceWidgetProps {
  userId?: string;
  userEmail?: string;
}

const StarBalanceWidget: React.FC<StarBalanceWidgetProps> = ({ userId, userEmail }) => {
  const [showPurchase, setShowPurchase] = useState(false);
  const { starBalance, claimDaily } = useStars(userId);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-yellow-600 hover:bg-yellow-50 px-2"
        onClick={() => setShowPurchase(true)}
      >
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
        <span className="font-semibold text-sm">{starBalance.balance}</span>
        <Plus className="w-3 h-3" />
      </Button>

      <StarPurchaseModal
        isOpen={showPurchase}
        onClose={() => setShowPurchase(false)}
        userId={userId}
        userEmail={userEmail}
        currentBalance={starBalance.balance}
        canClaimDaily={starBalance.canClaimDaily}
        onClaimDaily={claimDaily}
      />
    </>
  );
};

export default StarBalanceWidget;
