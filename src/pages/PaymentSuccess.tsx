
import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const { toast } = useToast();

  useEffect(() => {
    if (orderCode) {
      toast({
        title: "Thanh toán thành công!",
        description: "Tài khoản Premium của bạn đã được kích hoạt.",
      });
    }
  }, [orderCode, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Thanh toán thành công!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg">
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold text-lg">Chúc mừng!</h3>
            <p className="text-sm opacity-90">
              Tài khoản Premium của bạn đã được kích hoạt
            </p>
          </div>

          {orderCode && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Mã đơn hàng:</p>
              <p className="font-mono font-semibold">{orderCode}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Tính năng Premium đã kích hoạt:</h4>
            <ul className="text-left text-sm space-y-1">
              <li>✅ Không giới hạn lượt like</li>
              <li>✅ Xem ai đã thích bạn</li>
              <li>✅ Super Like không giới hạn</li>
              <li>✅ Boost hồ sơ</li>
              <li>✅ Ẩn quảng cáo</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/">
                Khám phá ngay
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Quay về trang chủ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
