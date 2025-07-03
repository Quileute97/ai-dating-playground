
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const PremiumUpgradeModal = ({ isOpen, onClose, userId }: PremiumUpgradeModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium_monthly' | 'premium_yearly'>('premium_monthly');
  const { toast } = useToast();

  const plans = {
    premium_monthly: {
      name: 'Premium Hàng Tháng',
      price: 99000,
      duration: '30 ngày',
      features: [
        'Không giới hạn lượt like',
        'Xem ai đã thích bạn',
        'Super Like không giới hạn',
        'Boost hồ sơ 3 lần/tuần',
        'Ẩn quảng cáo',
        'Ưu tiên hiển thị'
      ]
    },
    premium_yearly: {
      name: 'Premium Hàng Năm',
      price: 999000,
      duration: '365 ngày',
      features: [
        'Tất cả tính năng Premium Monthly',
        'Tiết kiệm 15% so với trả tháng',
        'Badge Premium đặc biệt',
        'Hỗ trợ ưu tiên',
        'Tính năng mới sớm nhất'
      ]
    }
  };

  const handleUpgrade = async () => {
    if (!userId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để nâng cấp Premium",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Creating premium invoice for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('create-premium-invoice', {
        body: {
          user_id: userId,
          plan_type: selectedPlan
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      console.log('Invoice creation response:', data);

      if (data.success && data.checkoutUrl) {
        // Mở PayOS trong tab mới
        window.open(data.checkoutUrl, '_blank');
        
        toast({
          title: "Đã tạo hóa đơn thành công!",
          description: "Vui lòng hoàn tất thanh toán trên PayOS để kích hoạt Premium",
        });
        
        onClose();
      } else {
        throw new Error(data.error || 'Không thể tạo hóa đơn thanh toán');
      }
    } catch (error) {
      console.error('Error creating premium invoice:', error);
      toast({
        title: "Lỗi tạo hóa đơn",
        description: error.message || "Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            Nâng cấp Premium
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(plans).map(([planKey, plan]) => (
            <Card 
              key={planKey}
              className={`cursor-pointer transition-all ${
                selectedPlan === planKey 
                  ? 'ring-2 ring-yellow-500 bg-yellow-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan(planKey as any)}
            >
              <CardHeader className="text-center">
                {planKey === 'premium_yearly' && (
                  <Badge className="w-fit mx-auto mb-2 bg-green-500">
                    Tiết kiệm nhất
                  </Badge>
                )}
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatPrice(plan.price)} VNĐ
                </div>
                <p className="text-sm text-gray-600">{plan.duration}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button 
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Nâng cấp ngay ({formatPrice(plans[selectedPlan].price)}đ)
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Thanh toán an toàn qua PayOS • Hỗ trợ 24/7
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeModal;
