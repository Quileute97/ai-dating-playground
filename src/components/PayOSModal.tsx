import React, { useState } from 'react';
import { CreditCard, X, Loader2, CheckCircle, BadgeCheck, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createPayOSPayment, generateOrderCode } from '@/services/payosService';
import { useUpgradeRequest } from './useUpgradeRequest';

interface PayOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageType: 'nearby' | 'gold';
  packageName: string;
  price: number;
  userId?: string;
  userEmail?: string;
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
  userId,
  userEmail,
  bankInfo,
}: PayOSModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [manualPaid, setManualPaid] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { submitUpgradeRequest } = useUpgradeRequest();

  const handlePayOSPayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const orderCode = generateOrderCode();
      
      // Tạo mô tả ngắn gọn để tránh lỗi PayOS (tối đa 25 ký tự)
      const shortDescription = packageType === 'nearby' ? 'Morong pham vi' : 'Nang cap Gold';
      
      const paymentData = {
        orderCode,
        amount: price,
        description: shortDescription,
        returnUrl: `${window.location.origin}/payment-success?orderCode=${orderCode}`,
        cancelUrl: `${window.location.origin}/payment-cancel?orderCode=${orderCode}`,
        userId,
        userEmail,
        packageType
      };

      const response = await createPayOSPayment(paymentData);

      if (response.error === 0 && response.data?.checkoutUrl) {
        setCheckoutUrl(response.data.checkoutUrl);
        toast({
          title: "Đã tạo liên kết thanh toán!",
          description: "Vui lòng hoàn tất thanh toán trên PayOS để kích hoạt tính năng.",
        });
        
        // Open PayOS checkout in new tab
        window.open(response.data.checkoutUrl, '_blank');
        
        setPaymentStep('success');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi xảy ra trong quá trình tạo thanh toán. Vui lòng thử lại.",
        variant: "destructive"
      });
      setPaymentStep('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPaid = async () => {
    if (userId) {
      const success = await submitUpgradeRequest({
        user_id: userId,
        user_email: userEmail,
        type: packageType,
        price,
        bank_info: bankInfo
      });

      if (success) {
        setManualPaid(true);
        toast({
          title: "Đã ghi nhận yêu cầu thanh toán",
          description: "Yêu cầu nâng cấp đã được gửi. Vui lòng chờ admin duyệt!",
        });
        
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể gửi yêu cầu nâng cấp. Vui lòng thử lại.",
          variant: "destructive"
        });
      }
    }
  };

  const handleClose = () => {
    setPaymentStep('confirm');
    setIsProcessing(false);
    setManualPaid(false);
    setCheckoutUrl(null);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

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
                onClick={handlePayOSPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Thanh toán qua PayOS
              </Button>
              
              {bankInfo && (
                <Button 
                  onClick={handleManualPaid}
                  disabled={isProcessing || manualPaid}
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 border border-green-400 text-green-700 font-semibold py-2"
                >
                  <BadgeCheck className="w-4 h-4" /> Đã chuyển khoản thủ công
                </Button>
              )}
              
              <Button variant="outline" onClick={handleClose} className="w-full">
                Hủy
              </Button>
            </div>
          </div>
        )}

        {manualPaid && (
          <div className="text-center py-8 flex flex-col items-center">
            <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
            <div className="font-semibold text-green-600 text-lg mb-1">
              Đã gửi yêu cầu nâng cấp!
            </div>
            <div className="text-gray-500 text-sm mb-2">
              Yêu cầu đã được gửi đến admin để duyệt.
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
            <div className="text-base font-semibold mb-1">Đang tạo liên kết thanh toán...</div>
            <div className="text-gray-600 text-sm">Vui lòng chờ trong giây lát</div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <div className="text-base font-semibold text-green-600 mb-2">
              Đã tạo liên kết thanh toán!
            </div>
            <div className="text-gray-500 text-sm mb-4">
              Vui lòng hoàn tất thanh toán trên PayOS để kích hoạt tính năng
            </div>
            {checkoutUrl && (
              <Button 
                onClick={() => window.open(checkoutUrl, '_blank')}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở lại liên kết thanh toán
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PayOSModal;
