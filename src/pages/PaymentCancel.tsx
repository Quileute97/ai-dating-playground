
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-red-800 mb-4">
          Thanh toán bị hủy
        </h1>
        
        <div className="space-y-3 text-gray-600 mb-6">
          <p>Giao dịch thanh toán đã bị hủy.</p>
          {orderCode && (
            <p className="text-sm">
              Mã đơn hàng: <span className="font-mono font-semibold">{orderCode}</span>
            </p>
          )}
          <p className="text-sm">
            Bạn có thể thử lại thanh toán bất cứ lúc nào.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại thanh toán
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ ({countdown}s)
          </Button>
        </div>
      </Card>
    </div>
  );
}
