
import { PaymentData, PackageDetails } from './types.ts';

export const generateOrderCode = (): number => {
  // Generate a unique order code that's always different
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  // Create a unique order code using timestamp + random
  let orderCode = parseInt(`${now}${random}`.slice(-9));
  
  // Ensure it's within PayOS valid range (1-999999999)
  if (orderCode > 999999999) {
    orderCode = orderCode % 999999999;
  }
  if (orderCode <= 0) {
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
  // Validate and clean input data
  const cleanOrderCode = Math.abs(Math.floor(orderCode));
  const cleanAmount = Math.abs(Math.floor(selectedPackage.amount));
  
  // Validate order code
  if (cleanOrderCode <= 0 || cleanOrderCode > 999999999) {
    throw new Error('Invalid order code: must be between 1 and 999999999');
  }
  
  // Validate amount
  if (cleanAmount <= 0) {
    throw new Error('Invalid amount: must be positive');
  }
  
  // Clean and validate email
  const cleanEmail = userEmail?.trim() || '';
  const isValidEmail = cleanEmail && cleanEmail.includes('@') && cleanEmail.length > 5;
  const buyerEmail = isValidEmail ? cleanEmail : 'customer@example.com';
  
  // Create buyer name from email (remove special chars)
  const buyerName = cleanEmail 
    ? cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'Customer'
    : 'Customer';
  
  // Clean description (remove special chars, max 25 chars)
  let description = selectedPackage.description
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờứụửữ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
    .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
    .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
    .replace(/[ÌÍỊỈĨ]/g, 'I')
    .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
    .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
    .replace(/[ỲÝỴỶỸ]/g, 'Y')
    .replace(/[Đ]/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove remaining special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  if (!description || description.length === 0) {
    description = 'Dating Package Payment';
  }
  if (description.length > 25) {
    description = description.substring(0, 25).trim();
  }
  
  // Validate URLs
  const validReturnUrl = returnUrl?.trim() || 'https://preview--ai-dating-playground.lovable.app/payment-success';
  const validCancelUrl = cancelUrl?.trim() || 'https://preview--ai-dating-playground.lovable.app/payment-cancel';
  
  // Create expiration time (2 hours from now)
  const expiredAt = Math.floor(Date.now() / 1000) + (2 * 60 * 60);
  
  const paymentData: PaymentData = {
    orderCode: cleanOrderCode,
    amount: cleanAmount,
    description: description,
    buyerName: buyerName,
    buyerEmail: buyerEmail,
    buyerPhone: '',
    buyerAddress: '',
    items: [{
      name: description.substring(0, 12),
      quantity: 1,
      price: cleanAmount
    }],
    returnUrl: validReturnUrl,
    cancelUrl: validCancelUrl,
    expiredAt: expiredAt
  };
  
  console.log('✅ Final PayOS payment data:', JSON.stringify(paymentData, null, 2));
  
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
  
  let userFriendlyMessage = 'Có lỗi xảy ra khi tạo thanh toán';
  
  if (error.message?.includes('PayOS API Error')) {
    userFriendlyMessage = `Lỗi PayOS: ${error.message.split(': ')[1] || 'Vui lòng thử lại'}`;
  } else if (error.message?.includes('Invalid package type')) {
    userFriendlyMessage = 'Gói thanh toán không hợp lệ';
  } else if (error.message?.includes('Missing required fields')) {
    userFriendlyMessage = 'Thiếu thông tin bắt buộc';
  } else if (error.message?.includes('PayOS credentials')) {
    userFriendlyMessage = 'Cấu hình PayOS chưa đúng';
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
