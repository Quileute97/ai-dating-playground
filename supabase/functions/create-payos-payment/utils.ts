
import { PaymentData, PackageDetails } from './types.ts';

export const generateOrderCode = (): number => {
  // Generate a simpler, more reliable order code
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 999) + 1;
  
  // Create 8-digit order code: 5 digits from timestamp + 3 random digits
  const orderCode = parseInt(`${timestamp.toString().slice(-5)}${random.toString().padStart(3, '0')}`);
  
  // Ensure it's within valid range (1-999999999)
  return Math.max(1, Math.min(orderCode, 999999999));
};

export const createPaymentData = (
  orderCode: number,
  selectedPackage: PackageDetails,
  userEmail?: string,
  returnUrl?: string,
  cancelUrl?: string
): PaymentData => {
  // Clean and validate email
  const cleanEmail = userEmail?.trim();
  const isValidEmail = cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.');
  const buyerEmail = isValidEmail ? cleanEmail : 'customer@example.com';
  
  // Create simple buyer name (no special characters)
  const buyerName = cleanEmail 
    ? cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 10) || 'Customer'
    : 'Customer';
  
  // Create simple description (max 25 chars, no special characters)
  let description = selectedPackage.description
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Ensure description is not empty and within limits
  if (!description || description.length === 0) {
    description = 'Premium Package';
  }
  if (description.length > 25) {
    description = description.substring(0, 25).trim();
  }
  
  // Validate amount
  const amount = Math.floor(Math.abs(selectedPackage.amount));
  if (amount <= 0) {
    throw new Error('Invalid amount: must be positive');
  }
  
  // Create expiration time (2 hours from now)
  const expiredAt = Math.floor(Date.now() / 1000) + (2 * 60 * 60);
  
  // Ensure URLs are valid
  const validReturnUrl = returnUrl || 'https://preview--ai-dating-playground.lovable.app/payment-success';
  const validCancelUrl = cancelUrl || 'https://preview--ai-dating-playground.lovable.app/payment-cancel';
  
  const paymentData: PaymentData = {
    orderCode: Math.abs(orderCode),
    amount: amount,
    description: description,
    buyerName: buyerName,
    buyerEmail: buyerEmail,
    buyerPhone: '',
    buyerAddress: '',
    items: [{
      name: description.substring(0, 12), // Keep item name shorter
      quantity: 1,
      price: amount
    }],
    returnUrl: validReturnUrl,
    cancelUrl: validCancelUrl,
    expiredAt: expiredAt
  };
  
  // Final validation
  if (!paymentData.orderCode || paymentData.orderCode <= 0) {
    throw new Error('Invalid order code');
  }
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    throw new Error('Invalid amount');
  }
  
  if (!paymentData.description || paymentData.description.trim().length === 0) {
    throw new Error('Invalid description');
  }
  
  if (paymentData.description.length > 25) {
    throw new Error('Description too long');
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
