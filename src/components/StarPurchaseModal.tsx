import React, { useState } from 'react';
import { Star, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createPayOSPayment, generateOrderCode } from '@/services/payosService';

const STAR_PACKAGES = [
  { id: 'stars_10', stars: 10, price: 10000, label: '10 ⭐', desc: 'Gói cơ bản' },
  { id: 'stars_50', stars: 50, price: 45000, label: '50 ⭐', desc: 'Tiết kiệm 10%', badge: 'Phổ biến' },
  { id: 'stars_100', stars: 100, price: 80000, label: '100 ⭐', desc: 'Tiết kiệm 20%', badge: 'Giá tốt nhất' },
];

interface StarPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  currentBalance: number;
  onClaimDaily?: () => void;
  canClaimDaily?: boolean;
}

const StarPurchaseModal: React.FC<StarPurchaseModalProps> = ({
  isOpen, onClose, userId, userEmail, currentBalance, onClaimDaily, canClaimDaily
}) => {
  const [processing, setProcessing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const { toast } = useToast();

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p);

  const handlePurchase = async (pkg: typeof STAR_PACKAGES[0]) => {
    if (!userId) {
      toast({ title: 'Lỗi', description: 'Vui lòng đăng nhập để mua sao.', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    setSelectedPkg(pkg.id);
    try {
      const orderCode = generateOrderCode();
      const response = await createPayOSPayment({
        orderCode,
        userId,
        userEmail,
        packageType: pkg.id,
        returnUrl: `${window.location.origin}/payment-success?orderCode=${orderCode}&stars=${pkg.stars}`,
        cancelUrl: `${window.location.origin}/payment-cancel?orderCode=${orderCode}`,
      });

      if (response.error === 0 && response.data?.checkoutUrl) {
        window.open(response.data.checkoutUrl, '_blank');
        toast({ title: 'Đã tạo liên kết thanh toán!', description: 'Vui lòng hoàn tất thanh toán trên PayOS.' });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({ title: 'Lỗi thanh toán', description: 'Không thể tạo thanh toán. Vui lòng thử lại.', variant: 'destructive' });
    } finally {
      setProcessing(false);
      setSelectedPkg(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            Nạp Sao
          </DialogTitle>
        </DialogHeader>

        <div className="text-center mb-3">
          <div className="text-sm text-muted-foreground">Số dư hiện tại</div>
          <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
            {currentBalance}
          </div>
        </div>

        {canClaimDaily && onClaimDaily && (
          <Button
            onClick={onClaimDaily}
            variant="outline"
            className="w-full mb-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            🎁 Nhận 5 sao miễn phí hôm nay
          </Button>
        )}

        <div className="space-y-2">
          {STAR_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className="p-3 cursor-pointer hover:border-yellow-400 transition-all relative"
              onClick={() => !processing && handlePurchase(pkg)}
            >
              {pkg.badge && (
                <span className="absolute -top-2 right-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {pkg.badge}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-base">{pkg.label}</div>
                  <div className="text-xs text-muted-foreground">{pkg.desc}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">{formatPrice(pkg.price)}đ</div>
                  {processing && selectedPkg === pkg.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
                  ) : (
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StarPurchaseModal;
