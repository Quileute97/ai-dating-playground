import { PaymentData, PackageDetails } from './types.ts';

export const generateOrderCode = (): number => {
  // Generate a more reliable order code
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  // Create order code by combining timestamp and random number
  let orderCode = parseInt(timestamp.toString().slice(-8) + random.toString().padStart(3, '0'));
  
  // Ensure it's within PayOS valid range (1-9999999999)
  if (orderCode > 9999999999) {
    orderCode = orderCode % 9999999999;
  }
  if (orderCode < 1) {
    orderCode = Math.floor(Math.random() * 999999999) + 1;
  }
  
  return orderCode;
};

export const createPaymentData = (
  orderCode: number,
  selectedPackage: PackageDetails,
  userEmail?: string,
  returnUrl?: string,
  cancelUrl?: string
): PaymentData => {
  // Clean and validate buyer name - PayOS requires specific format
  const buyerName = userEmail 
    ? userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 15) // Remove special chars
    : 'Customer';
  
  // Clean and validate buyer email
  const buyerEmail = userEmail || 'customer@example.com';
  
  // Ensure description is within PayOS limits (max 25 chars, no special chars)
  let description = selectedPackage.description.replace(/[^a-zA-Z0-9\s]/g, '');
  if (description.length > 25) {
    description = description.substring(0, 25).trim();
  }
  
  // Calculate expiration time (15 minutes from now)
  const expiredAt = Math.floor(Date.now() / 1000) + (15 * 60);
  
  return {
    orderCode: orderCode,
    amount: selectedPackage.amount,
    description: description,
    buyerName: buyerName,
    buyerEmail: buyerEmail,
    buyerPhone: '',
    buyerAddress: '',
    items: [{
      name: description.substring(0, 20), // Ensure item name is also limited
      quantity: 1,
      price: selectedPackage.amount
    }],
    returnUrl: returnUrl || 'https://preview--ai-dating-playground.lovable.app/payment-success',
    cancelUrl: cancelUrl || 'https://preview--ai-dating-playground.lovable.app/payment-cancel',
    expiredAt: expiredAt
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
  
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be non-empty string');
  }
  
  if (typeof packageType !== 'string' || packageType.trim().length === 0) {
    throw new Error('Invalid packageType: must be non-empty string');
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
  } else if (error.message?.includes('Invalid order code')) {
    userFriendlyMessage = 'Mã đơn hàng không hợp lệ';
  } else if (error.message?.includes('Invalid amount')) {
    userFriendlyMessage = 'Số tiền thanh toán không hợp lệ';
  }
  
  return {
    error: 1,
    message: userFriendlyMessage,
    originalError: error.message
  };
};
