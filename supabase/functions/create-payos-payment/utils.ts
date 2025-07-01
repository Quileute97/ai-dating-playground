
import { PaymentData, PackageDetails } from './types.ts';

export const generateOrderCode = (): number => {
  const timestamp = Date.now();
  return parseInt(timestamp.toString().slice(-8)); // Lấy 8 chữ số cuối
};

export const createPaymentData = (
  orderCode: number,
  selectedPackage: PackageDetails,
  userEmail?: string,
  returnUrl?: string,
  cancelUrl?: string
): PaymentData => {
  return {
    orderCode: orderCode,
    amount: selectedPackage.amount,
    description: selectedPackage.description,
    buyerName: userEmail ? userEmail.split('@')[0] : 'Customer',
    buyerEmail: userEmail || 'noreply@example.com',
    buyerPhone: '',
    buyerAddress: '',
    items: [{
      name: selectedPackage.description,
      quantity: 1,
      price: selectedPackage.amount
    }],
    returnUrl: returnUrl || 'https://preview--ai-dating-playground.lovable.app/payment-success',
    cancelUrl: cancelUrl || 'https://preview--ai-dating-playground.lovable.app/payment-cancel',
    expiredAt: Math.floor(Date.now() / 1000) + (15 * 60)
  };
};

export const createUpgradeRequestData = (
  userId: string,
  userEmail: string | undefined,
  packageType: string,
  selectedPackage: PackageDetails,
  orderCode: number,
  payosResult: any
) => {
  return {
    user_id: userId,
    user_email: userEmail || null,
    type: packageType,
    price: selectedPackage.amount,
    duration_days: selectedPackage.duration,
    expires_at: selectedPackage.duration > 0 
      ? new Date(Date.now() + selectedPackage.duration * 24 * 60 * 60 * 1000).toISOString()
      : null,
    status: 'pending',
    bank_info: {
      orderCode: orderCode,
      paymentLinkId: payosResult.data.paymentLinkId,
      checkoutUrl: payosResult.data.checkoutUrl,
      amount: selectedPackage.amount,
      description: selectedPackage.description
    }
  };
};

export const validateInput = (userId: string, packageType: string) => {
  if (!userId || !packageType) {
    throw new Error('Missing required fields: userId or packageType');
  }
};

export const createErrorResponse = (error: Error) => {
  console.error('💥 Payment creation failed:', error);
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  console.log('=== PayOS Payment Request Failed ===');
  
  let userFriendlyMessage = 'Có lỗi xảy ra khi tạo thanh toán';
  
  if (error.message?.includes('PayOS API Error')) {
    userFriendlyMessage = `Lỗi PayOS: ${error.message.split(': ')[1] || 'Vui lòng thử lại'}`;
  } else if (error.message?.includes('Invalid package type')) {
    userFriendlyMessage = 'Gói thanh toán không hợp lệ';
  } else if (error.message?.includes('Missing required fields')) {
    userFriendlyMessage = 'Thiếu thông tin bắt buộc';
  } else if (error.message?.includes('PayOS credentials')) {
    userFriendlyMessage = 'Cấu hình PayOS chưa đúng';
  } else if (error.message?.includes('Lỗi kết nối PayOS')) {
    userFriendlyMessage = error.message;
  } else if (error.message?.includes('PayOS không trả về URL')) {
    userFriendlyMessage = error.message;
  }
  
  return {
    error: 1,
    message: userFriendlyMessage,
    originalError: error.message
  };
};
