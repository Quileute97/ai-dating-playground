
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev -  1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-green-800 mb-4">
          Thanh toán thành công!
        </h1>
        
        <div className="space-y-3 text-gray-600 mb-6">
          <p>Cảm ơn bạn đã nâng cấp tài khoản!</p>
          {orderCode && (
            <p className="text-sm">
              Mã đơn hàng: <span className="font-mono font-semibold">{orderCode}</span>
            </p>
          )}
          <p className="text-sm">
            Tính năng premium đã được kích hoạt cho tài khoản của bạn.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ ({countdown}s)
          </Button>
        </div>
      </Card>
    </div>
  );
}
