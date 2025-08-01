import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import { createPayOSPayment } from '@/services/payosService';
import { DATING_PACKAGES } from '@/services/datingPackageService';
import { NEARBY_PACKAGES } from '@/services/nearbyPackageService';
import { supabase } from '@/integrations/supabase/client';

interface PaymentPageProps {}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [user, setUser] = useState<any>(null);

  const packageType = searchParams.get('type'); // 'dating' or 'nearby'
  const packageId = searchParams.get('package');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Get package details
  const getPackageInfo = () => {
    if (packageType === 'dating') {
      return DATING_PACKAGES.find(p => p.id === packageId);
    } else if (packageType === 'nearby') {
      return NEARBY_PACKAGES.find(p => p.id === packageId);
    }
    return null;
  };

  const packageInfo = getPackageInfo();

  useEffect(() => {
    if (!packageType || !packageId || !packageInfo) {
      toast.error('Thông tin gói nâng cấp không hợp lệ');
      navigate('/');
    }
  }, [packageType, packageId, packageInfo, navigate]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handlePayment = async () => {
    if (!user || !packageInfo) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const paymentData = {
        orderCode: Date.now(),
        amount: packageInfo.price,
        description: `Nâng cấp ${packageType === 'dating' ? 'Hẹn Hò' : 'Quanh Đây'} - ${packageInfo.name}`,
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
        userId: user.id,
        userEmail: user.email || '',
        packageType: packageId // Sử dụng trực tiếp packageId thay vì kết hợp
      };

      console.log('Payment data:', paymentData);
      console.log('Package info:', packageInfo);

      const response = await createPayOSPayment(paymentData);

      if (response.error === 0 && response.data?.checkoutUrl) {
        toast.success('Đang chuyển đến trang thanh toán...');
        // Redirect to PayOS checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error(response.message || 'Không thể tạo liên kết thanh toán');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo thanh toán');
      setPaymentStep('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!packageInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Nâng cấp Premium</h1>
          <p className="text-muted-foreground">
            {packageType === 'dating' ? 'Tính năng Hẹn Hò' : 'Tính năng Quanh Đây'}
          </p>
        </div>

        {/* Payment Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Chi tiết thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Package Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{packageInfo.name}</h3>
                <p className="text-sm text-muted-foreground">{packageInfo.description}</p>
              </div>
              <Badge variant="secondary">
                {packageType === 'dating' ? 'Hẹn Hò' : 'Quanh Đây'}
              </Badge>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h4 className="font-medium mb-3">Tính năng bao gồm:</h4>
              <div className="grid grid-cols-1 gap-2">
                {packageInfo.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Tổng thanh toán:</span>
              <span className="text-primary">{formatPrice(packageInfo.price)}</span>
            </div>

            {/* Duration */}
            {packageInfo.duration > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Thời hạn: {packageInfo.duration} ngày</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Thanh toán an toàn</p>
                <p className="text-sm text-muted-foreground">
                  Được bảo mật bởi PayOS - Hỗ trợ 24/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || paymentStep !== 'confirm'}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Thanh toán {formatPrice(packageInfo.price)}
                </>
              )}
            </Button>

            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isProcessing}
              >
                Quay lại
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Bằng cách nhấn "Thanh toán", bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;