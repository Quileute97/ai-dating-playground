import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh toán đã bị hủy
            </h1>
            <p className="text-gray-600">
              Bạn đã hủy quá trình thanh toán. Không có khoản tiền nào được trừ từ tài khoản của bạn.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Bạn vẫn có thể nâng cấp</span>
            </div>
            <p className="text-sm text-yellow-700">
              Premium sẽ mang đến trải nghiệm hẹn hò tuyệt vời hơn với nhiều tính năng độc quyền.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Thử nâng cấp Premium lại
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCancel;