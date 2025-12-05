import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';

interface UsageLimitBarProps {
  userId?: string;
  action: 'swipe' | 'superlike' | 'message' | 'upload_photo';
  currentCount: number;
  label: string;
  className?: string;
}

export default function UsageLimitBar({
  userId,
  action,
  currentCount,
  label,
  className = ''
}: UsageLimitBarProps) {
  const { isPremium, getCurrentLimits, getRemainingActions } = usePremiumFeatures(userId);
  
  const limits = getCurrentLimits();
  const remaining = getRemainingActions(action, currentCount);
  
  // Get the limit for this action
  let limit = 0;
  switch (action) {
    case 'swipe':
      limit = limits.dailySwipes;
      break;
    case 'superlike':
      limit = limits.dailySuperLikes;
      break;
    case 'message':
      limit = limits.dailyMessages;
      break;
    case 'upload_photo':
      limit = limits.maxAlbumPhotos;
      break;
  }

  // If unlimited (premium), show premium badge
  if (limit === -1) {
    return (
      <div className={`flex items-center justify-between p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg ${className}`}>
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="premium" className="text-xs">
          Không giới hạn
        </Badge>
      </div>
    );
  }

  const percentage = Math.min((currentCount / limit) * 100, 100);
  const isNearLimit = percentage > 80;
  const isAtLimit = currentCount >= limit;

  return (
    <div className={`space-y-2 p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}`}>
            {currentCount}/{limit}
          </span>
          {isAtLimit && (
            <Badge variant="destructive" className="text-xs">
              Đã hết
            </Badge>
          )}
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-gray-200'}`}
      />
      
      {remaining !== null && remaining > 0 && (
        <p className="text-xs text-gray-500">
          Còn lại {remaining} lần
        </p>
      )}
      
      {isAtLimit && !isPremium && (
        <p className="text-xs text-red-500">
          Nâng cấp Premium để sử dụng không giới hạn
        </p>
      )}
    </div>
  );
}