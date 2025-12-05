import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, Infinity } from 'lucide-react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

interface PremiumBadgeProps {
  userId?: string;
  className?: string;
}

export default function PremiumBadge({ userId, className = '' }: PremiumBadgeProps) {
  const { premiumStatus, isLoading } = usePremiumStatus(userId);

  if (isLoading || !premiumStatus?.isPremium) {
    return null;
  }

  const { daysRemaining, packageType } = premiumStatus;

  const getBadgeContent = () => {
    if (daysRemaining === null) {
      return {
        icon: <Crown className="w-3 h-3" />,
        text: 'Premium',
        variant: 'premium' as const,
        description: 'Vĩnh viễn'
      };
    }

    if (daysRemaining <= 3) {
      return {
        icon: <Clock className="w-3 h-3" />,
        text: `${daysRemaining} ngày`,
        variant: 'destructive' as const,
        description: 'Sắp hết hạn'
      };
    }

    return {
      icon: <Crown className="w-3 h-3" />,
      text: `${daysRemaining} ngày`,
      variant: 'premium' as const,
      description: 'Premium'
    };
  };

  const badgeContent = getBadgeContent();

  return (
    <Badge 
      variant={badgeContent.variant}
      className={`flex items-center gap-1 ${className}`}
      title={`${badgeContent.description} - ${packageType || 'Premium'}`}
    >
      {badgeContent.icon}
      <span className="text-xs font-medium">{badgeContent.text}</span>
    </Badge>
  );
}