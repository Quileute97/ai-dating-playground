import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useToast } from '@/hooks/use-toast';

export function usePremiumFeatures(userId?: string) {
  const { premiumStatus } = usePremiumStatus(userId);
  const { toast } = useToast();

  const showPremiumRequired = (featureName: string) => {
    toast({
      title: "Tính năng Premium",
      description: `${featureName} yêu cầu tài khoản Premium. Hãy nâng cấp để sử dụng!`,
      variant: "destructive"
    });
  };

  const checkPremiumFeature = (featureName: string, onSuccess?: () => void): boolean => {
    if (!premiumStatus?.isPremium) {
      showPremiumRequired(featureName);
      return false;
    }

    if (onSuccess) {
      onSuccess();
    }
    return true;
  };

  // Premium features configuration
  const features = {
    // Dating features
    unlimitedSwipes: () => checkPremiumFeature("Swipe không giới hạn"),
    superLike: () => checkPremiumFeature("Super Like"),
    seeWhoLikedYou: () => checkPremiumFeature("Xem ai đã thích bạn"),
    boostProfile: () => checkPremiumFeature("Boost hồ sơ"),
    rewind: () => checkPremiumFeature("Hoàn tác"),
    passport: () => checkPremiumFeature("Thay đổi vị trí"),
    readReceipts: () => checkPremiumFeature("Biết khi tin nhắn được đọc"),
    topPicks: () => checkPremiumFeature("Top Picks"),
    hideAds: () => checkPremiumFeature("Ẩn quảng cáo"),

    // Nearby features  
    unlimitedNearbyChats: () => checkPremiumFeature("Chat không giới hạn với người xung quanh"),
    extendedRadius: () => checkPremiumFeature("Mở rộng bán kính tìm kiếm"),
    prioritySupport: () => checkPremiumFeature("Hỗ trợ ưu tiên"),

    // Timeline features
    premiumBadge: () => checkPremiumFeature("Badge Premium"),
    priorityDisplay: () => checkPremiumFeature("Hiển thị ưu tiên"),

    // Generic feature checker
    checkFeature: checkPremiumFeature
  };

  // Free limits (applies when not premium)
  const freeLimits = {
    dailySwipes: 20,
    dailySuperLikes: 1,
    dailyMessages: 10,
    nearbyRadius: 5, // km
    maxAlbumPhotos: 3
  };

  // Premium limits (unlimited or much higher)
  const premiumLimits = {
    dailySwipes: -1, // unlimited
    dailySuperLikes: -1, // unlimited  
    dailyMessages: -1, // unlimited
    nearbyRadius: 100, // km
    maxAlbumPhotos: 20
  };

  const getCurrentLimits = () => {
    return premiumStatus?.isPremium ? premiumLimits : freeLimits;
  };

  const canPerformAction = (action: string, currentCount: number): boolean => {
    const limits = getCurrentLimits();
    
    switch (action) {
      case 'swipe':
        return limits.dailySwipes === -1 || currentCount < limits.dailySwipes;
      case 'superlike':
        return limits.dailySuperLikes === -1 || currentCount < limits.dailySuperLikes;
      case 'message':
        return limits.dailyMessages === -1 || currentCount < limits.dailyMessages;
      case 'upload_photo':
        return limits.maxAlbumPhotos === -1 || currentCount < limits.maxAlbumPhotos;
      default:
        return true;
    }
  };

  const getRemainingActions = (action: string, currentCount: number): number | null => {
    const limits = getCurrentLimits();
    
    switch (action) {
      case 'swipe':
        return limits.dailySwipes === -1 ? null : Math.max(0, limits.dailySwipes - currentCount);
      case 'superlike':
        return limits.dailySuperLikes === -1 ? null : Math.max(0, limits.dailySuperLikes - currentCount);
      case 'message':
        return limits.dailyMessages === -1 ? null : Math.max(0, limits.dailyMessages - currentCount);
      case 'upload_photo':
        return limits.maxAlbumPhotos === -1 ? null : Math.max(0, limits.maxAlbumPhotos - currentCount);
      default:
        return null;
    }
  };

  return {
    isPremium: premiumStatus?.isPremium || false,
    premiumStatus,
    features,
    getCurrentLimits,
    canPerformAction,
    getRemainingActions,
    showPremiumRequired
  };
}