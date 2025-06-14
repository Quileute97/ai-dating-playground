
import React, { useState } from 'react';
import { CreditCard, X, Loader2, CheckCircle, BadgeCheck } from 'lucide-react';
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
  const [manualPaid, setManualPaid] = useState(false);
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

  const handleManualPaid = () => {
    setManualPaid(true);
    toast({
      title: "Đã ghi nhận thanh toán",
      description: "Bạn có thể sử dụng tính năng nâng cao tạm thời (chờ admin duyệt)!",
    });
    onSuccess();
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleClose = () => {
    setPaymentStep('confirm');
    setIsProcessing(false);
    setManualPaid(false);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Nội dung tối giản khung modal
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Thanh toán {packageName}
          </DialogTitle>
        </DialogHeader>

        {paymentStep === 'confirm' && !manualPaid && (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{packageName}</h3>
                <div className="text-xl font-bold text-orange-600 mb-1">
                  {formatPrice(price)} VNĐ
                </div>
                {/* Mô tả rất gọn */}
                {packageType === 'nearby' && (
                  <p className="text-xs text-gray-600">
                    Tìm người quanh đây 20km trong 30 ngày
                  </p>
                )}
                {packageType === 'gold' && (
                  <div className="text-xs text-gray-600">
                    GOLD: Không giới hạn match + Ưu tiên đặc biệt
                  </div>
                )}
              </div>
            </Card>
            
            {/* Bank Info Display - gọn */}
            {bankInfo && (
              <div className="space-y-1 border p-3 rounded-lg bg-white shadow text-sm">
                <div><span className="font-medium">Ngân hàng:</span> {bankInfo.bankName}</div>
                <div><span className="font-medium">Số tài khoản:</span> {bankInfo.accountNumber}</div>
                <div><span className="font-medium">Chủ TK:</span> {bankInfo.accountHolder}</div>
                {bankInfo.qrUrl && (
                  <div className="mt-1 flex flex-col items-center">
                    <img 
                      src={bankInfo.qrUrl}
                      alt="QR chuyển khoản"
                      className="w-28 h-28 object-contain rounded border"
                    />
                    <div className="mt-1 text-xs text-gray-400">
                      Quét mã QR để chuyển khoản
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Thanh toán qua PayOS
              </Button>
              <Button 
                onClick={handleManualPaid}
                disabled={isProcessing || manualPaid}
                variant="secondary"
                className="w-full flex items-center justify-center gap-2 border border-green-400 text-green-700 font-semibold py-2"
              >
                <BadgeCheck className="w-4 h-4" /> Đã Thanh Toán
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Xử lý khi user bấm Đã Thanh Toán */}
        {manualPaid && (
          <div className="text-center py-8 flex flex-col items-center">
            <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
            <div className="font-semibold text-green-600 text-lg mb-1">Truy cập tạm thời đã được kích hoạt!</div>
            <div className="text-gray-500 text-sm mb-2">
              Bạn đã có thể sử dụng tính năng nâng cao (đợi admin xác nhận chính thức).
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
            <div className="text-base font-semibold mb-1">Đang xử lý thanh toán...</div>
            <div className="text-gray-600 text-sm">Vui lòng không đóng cửa sổ này</div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <div className="text-base font-semibold text-green-600 mb-1">
              Thanh toán thành công!
            </div>
            <div className="text-gray-500 text-sm">
              Tính năng {packageName} đã được kích hoạt
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PayOSModal;
