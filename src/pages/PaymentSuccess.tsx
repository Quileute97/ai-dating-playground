import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const { toast } = useToast();

  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderCode) {
        setIsVerifying(false);
        return;
      }

      try {
        console.log('🔍 Verifying payment for order:', orderCode);
        
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
          body: null,
        });

        if (error) {
          console.error('❌ Error verifying payment:', error);
          throw error;
        }

        if (data?.success && data?.data?.isPaid) {
          setPaymentVerified(true);
          toast({
            title: "🎉 Thanh toán thành công!",
            description: "Tài khoản Premium của bạn đã được kích hoạt.",
          });
        }
      } catch (error) {
        console.error('💥 Payment verification error:', error);
        toast({
          title: "Không thể xác minh thanh toán",
          description: "Vui lòng liên hệ hỗ trợ nếu bạn đã thanh toán thành công.",
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderCode, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {isVerifying ? (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 mx-auto text-purple-500 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-800">
              Đang xác minh thanh toán...
            </h1>
            <p className="text-gray-600">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500" />
                <Crown className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {paymentVerified ? 'Thanh toán thành công!' : 'Cảm ơn bạn!'}
              </h1>
              <p className="text-gray-600">
                {paymentVerified 
                  ? 'Tài khoản Premium của bạn đã được kích hoạt và sẵn sàng sử dụng.'
                  : 'Chúng tôi đang xác minh thanh toán của bạn. Bạn sẽ nhận được thông báo khi hoàn tất.'
                }
              </p>
            </div>

            {paymentVerified && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">
                  🎉 Chúc mừng! Bạn đã là thành viên Premium
                </h3>
                <ul className="text-sm text-purple-700 text-left space-y-1">
                  <li>• Không giới hạn lượt thích</li>
                  <li>• Chat với tất cả matches</li>
                  <li>• Xem ai đã thích bạn</li>
                  <li>• Profile được ưu tiên hiển thị</li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Bắt đầu sử dụng Premium
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {orderCode && (
                <p className="text-xs text-gray-500">
                  Mã đơn hàng: {orderCode}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentSuccess;