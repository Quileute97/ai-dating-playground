import React, { useState } from 'react';
import { CreditCard, X, Loader2, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createPayOSPayment, generateOrderCode } from '@/services/payosService';

interface PayOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageType: 'nearby' | 'gold';
  packageName: string;
  price: number;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrUrl: string;
  };
}

const PayOSModal = ({
  isOpen,
  onClose,
  onSuccess,
  packageType,
  packageName,
  price,
  bankInfo,
}: PayOSModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const orderCode = generateOrderCode();
      const paymentData = {
        orderCode,
        amount: price,
        description: `Thanh toán ${packageName}`,
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`
      };

      const response = await createPayOSPayment(paymentData);

      if (response.error === 0 && response.data?.checkoutUrl) {
        // Simulate successful payment for demo
        setTimeout(() => {
          setPaymentStep('success');
          toast({
            title: "Thanh toán thành công!",
            description: `Bạn đã nâng cấp thành công ${packageName}`,
          });
          
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
        variant: "destructive"
      });
      setPaymentStep('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentStep('confirm');
    setIsProcessing(false);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Thanh toán PayOS
          </DialogTitle>
        </DialogHeader>

        {paymentStep === 'confirm' && (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{packageName}</h3>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {formatPrice(price)} VNĐ
                </div>
                {packageType === 'nearby' && (
                  <p className="text-sm text-gray-600">
                    Mở rộng phạm vi tìm kiếm lên 20km trong 30 ngày
                  </p>
                )}
                {packageType === 'gold' && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>✨ Không giới hạn lượt match</p>
                    <p>🚀 Mở rộng phạm vi tìm kiếm</p>
                    <p>💎 Ưu tiên hiển thị profile</p>
                    <p>📱 Xem ai đã thích bạn</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium">Thông tin thanh toán:</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gói dịch vụ:</span>
                  <span className="font-medium">{packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giá:</span>
                  <span className="font-medium">{formatPrice(price)} VNĐ</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-orange-600">{formatPrice(price)} VNĐ</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Hủy
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Thanh toán ngay
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Đang xử lý thanh toán...</h3>
            <p className="text-gray-600">Vui lòng không đóng cửa sổ này</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Thanh toán thành công!
            </h3>
            <p className="text-gray-600">
              Tính năng {packageName} đã được kích hoạt
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PayOSModal;
