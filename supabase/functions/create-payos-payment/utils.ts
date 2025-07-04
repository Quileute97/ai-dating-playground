
import { PaymentData, PackageDetails } from './types.ts';

export const generateOrderCode = (): number => {
  // Generate a safer, shorter order code for PayOS
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 99) + 1;
  
  // Use only the last 6 digits of timestamp + 2 digit random (8 digits total)
  let orderCode = parseInt(`${timestamp.toString().slice(-6)}${random.toString().padStart(2, '0')}`);
  
  // Ensure it's within PayOS valid range (1-999999999) and not too large
  if (orderCode > 99999999 || orderCode <= 0) {
    orderCode = Math.floor(Math.random() * 99999999) + 10000000;
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
  // Create a very clean buyer name without special characters
  const buyerName = userEmail 
    ? userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
    : 'Customer';
  
  // Ensure valid email format
  const buyerEmail = userEmail && userEmail.includes('@') && userEmail.includes('.') 
    ? userEmail 
    : 'customer@example.com';
  
  // Create very simple description (max 25 chars for PayOS)
  const description = selectedPackage.description
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .substring(0, 20); // Keep under 25 chars limit
  
  // Calculate expiration time (30 minutes from now)
  const expiredAt = Math.floor(Date.now() / 1000) + (30 * 60);
  
  // Ensure amount is valid integer
  const amount = Math.floor(selectedPackage.amount);
  if (amount <= 0) {
    throw new Error('Invalid amount: must be positive integer');
  }
  
  const paymentData: PaymentData = {
    orderCode: orderCode,
    amount: amount,
    description: description || 'Premium Package',
    buyerName: buyerName || 'Customer',
    buyerEmail: buyerEmail,
    buyerPhone: '',
    buyerAddress: '',
    items: [{
      name: (description || 'Premium').substring(0, 12),
      quantity: 1,
      price: amount
    }],
    returnUrl: returnUrl || 'https://preview--ai-dating-playground.lovable.app/payment-success',
    cancelUrl: cancelUrl || 'https://preview--ai-dating-playground.lovable.app/payment-cancel',
    expiredAt: expiredAt
  };
  
  // Validate required fields
  if (!paymentData.orderCode || paymentData.orderCode <= 0) {
    throw new Error('Invalid orderCode');
  }
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    throw new Error('Invalid amount');
  }
  
  if (!paymentData.description || paymentData.description.trim().length === 0) {
    throw new Error('Invalid description');
  }
  
  return paymentData;
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
  } else if (error.message?.includes('Invalid description')) {
    userFriendlyMessage = 'Mô tả thanh toán không hợp lệ';
  }
  
  return {
    error: 1,
    message: userFriendlyMessage,
    originalError: error.message
  };
};
