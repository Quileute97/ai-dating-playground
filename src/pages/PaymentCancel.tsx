
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Thanh toán đã bị hủy
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="text-sm">
              Giao dịch của bạn đã bị hủy. Không có khoản tiền nào bị trừ từ tài khoản của bạn.
            </p>
          </div>

          {orderCode && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Mã đơn hàng:</p>
              <p className="font-mono font-semibold">{orderCode}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Bạn có thể:</h4>
            <ul className="text-left text-sm space-y-1">
              <li>• Thử lại thanh toán với phương thức khác</li>
              <li>• Kiểm tra thông tin thẻ/tài khoản</li>
              <li>• Liên hệ hỗ trợ nếu cần giúp đỡ</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Thử lại thanh toán
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

export default PaymentCancel;
