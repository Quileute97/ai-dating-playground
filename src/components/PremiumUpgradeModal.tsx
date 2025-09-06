import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Heart, MessageCircle, Users, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DATING_PACKAGES } from '@/services/datingPackageService';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId?: string;
  userEmail?: string;
}

const PremiumUpgradeModal = ({ isOpen, onClose, onSuccess, userId, userEmail }: PremiumUpgradeModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('dating_month'); // Default to most popular
  const { toast } = useToast();

  const premiumFeatures = [
    {
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      title: "Không giới hạn lượt thích",
      description: "Thích không giới hạn mọi profile bạn yêu thích"
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      title: "Chat không giới hạn",
      description: "Nhắn tin với tất cả matches của bạn"
    },
    {
      icon: <Users className="w-5 h-5 text-green-500" />,
      title: "Xem ai đã thích bạn",
      description: "Biết ngay ai đang quan tâm đến bạn"
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      title: "Boost profile",
      description: "Profile của bạn sẽ được ưu tiên hiển thị"
    },
    {
      icon: <Crown className="w-5 h-5 text-purple-500" />,
      title: "Badge Premium",
      description: "Hiển thị badge Premium trên profile"
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleUpgrade = async () => {
    if (!userId) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để tiếp tục",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🚀 Starting premium upgrade process...', { packageType: selectedPackage });
      
      const { data, error } = await supabase.functions.invoke('create-payos-payment', {
        body: {
          packageType: selectedPackage,
          userId: userId,
          userEmail: userEmail || ""
        }
      });

      if (error) {
        console.error('❌ Error creating payment:', error);
        throw error;
      }

      if (data?.error === 0 && data?.data?.checkoutUrl) {
        console.log('✅ Payment link created successfully');
        toast({
          title: "Đang chuyển hướng...",
          description: "Bạn sẽ được chuyển đến trang thanh toán PayOS",
        });
        
        // Redirect to PayOS checkout
        window.open(data.data.checkoutUrl, '_blank');
        onClose();
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data?.message || 'Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('💥 Payment error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi xảy ra khi tạo liên kết thanh toán. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Crown className="w-6 h-6 text-yellow-500" />
            Nâng cấp Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Selection */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Chọn gói Premium:</h4>
            <div className="space-y-3">
              {DATING_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selectedPackage === pkg.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-sm">{pkg.name}</h5>
                        {pkg.id === 'dating_month' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            PHỔ BIẾN
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{pkg.description}</p>
                      <div className="text-lg font-bold text-purple-600">
                        {formatPrice(pkg.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pkg.duration === -1 ? 'Vĩnh viễn' : `${pkg.duration} ngày`}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPackage === pkg.id 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPackage === pkg.id && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Package Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Quyền lợi Premium:</h4>
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5">{feature.icon}</div>
                <div>
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-600">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Nâng cấp ngay
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={onClose} className="w-full">
              Để sau
            </Button>
          </div>

          {/* Payment Info */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-3 h-3" />
              Thanh toán an toàn qua PayOS
            </div>
            <div>Hỗ trợ thanh toán qua QR Banking, ATM, Visa, Mastercard</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeModal;