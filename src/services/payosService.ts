
import { supabase } from '@/integrations/supabase/client';

export interface PaymentData {
  packageType: string;
  userId: string;
  userEmail?: string;
  orderCode?: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  error: number;
  message: string;
  data?: {
    checkoutUrl: string;
    orderCode: number;
    paymentLinkId?: string;
    amount?: number;
    description?: string;
  };
  originalError?: string;
}

// Enhanced order code generation with collision avoidance
export const generateOrderCode = (): number => {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1000);
  let orderCode = parseInt(`${timestamp}${random}`.slice(-9));
  
  // Ensure within PayOS valid range
  if (orderCode > 999999999) {
    orderCode = orderCode % 999999999;
  }
  if (orderCode <= 0) {
    orderCode = Math.floor(Math.random() * 999999999) + 1;
  }
  
  return orderCode;
};

// Validate payment data before sending
const validatePaymentData = (paymentData: PaymentData) => {
  const errors: string[] = [];
  
  if (!paymentData.packageType) {
    errors.push('Package type is required');
  }
  
  if (!paymentData.userId) {
    errors.push('User ID is required');
  }
  
  return errors;
};

export const createPayOSPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    console.log('🚀 Creating PayOS payment:', paymentData);
    
    // Validate payment data
    const validationErrors = validatePaymentData(paymentData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Get auth session for authorization header
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Vui lòng đăng nhập để tiếp tục');
    }
    
    // Prepare the request with proper formatting
    const requestBody = {
      orderCode: paymentData.orderCode || generateOrderCode(),
      userId: paymentData.userId,
      userEmail: paymentData.userEmail || '',
      packageType: paymentData.packageType,
      returnUrl: paymentData.returnUrl || `${window.location.origin}/payment-success`,
      cancelUrl: paymentData.cancelUrl || `${window.location.origin}/payment-cancel`,
    };
    
    console.log('📤 Sending request:', requestBody);
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new Error('Invalid response from payment service');
    }
    
    console.log('📥 Response:', { status: response.status, result });
    
    if (!response.ok) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('💥 PayOS payment error:', error);
    
    let userMessage = 'Có lỗi xảy ra khi tạo thanh toán';
    
    if (error.message?.includes('Validation failed')) {
      userMessage = 'Dữ liệu thanh toán không hợp lệ';
    } else if (error.message?.includes('PayOS API Error')) {
      userMessage = error.message;
    } else if (error.message?.includes('Network')) {
      userMessage = 'Lỗi kết nối mạng. Vui lòng thử lại.';
    }
    
    return {
      error: 1,
      message: userMessage,
      originalError: error.message
    };
  }
};

export const createNearbyPackagePayment = async (
  packageId: string,
  userId: string,
  userEmail?: string
): Promise<PaymentResponse> => {
  try {
    console.log('🚀 Creating nearby package payment:', { packageId, userId });
    
    if (!packageId || !userId) {
      throw new Error('Package ID and User ID are required');
    }

    // Get auth session for authorization header
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Vui lòng đăng nhập để tiếp tục');
    }
    
    const requestBody = {
      orderCode: generateOrderCode(),
      userId,
      userEmail: userEmail || '',
      packageType: packageId,
      returnUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/payment-cancel`,
    };
    
    console.log('📤 Sending nearby payment request:', requestBody);
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse nearby payment response:', parseError);
      throw new Error('Invalid response from payment service');
    }
    
    console.log('📥 Nearby payment response:', { status: response.status, result });
    
    if (!response.ok) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('💥 PayOS nearby package payment error:', error);
    return {
      error: 1,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo thanh toán'
    };
  }
};
