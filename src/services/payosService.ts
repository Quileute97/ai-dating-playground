
export interface PaymentData {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  userId?: string;
  userEmail?: string;
  packageType: string;
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
  
  if (!paymentData.orderCode || paymentData.orderCode <= 0) {
    errors.push('Order code must be positive');
  }
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.push('Amount must be positive');
  }
  
  if (!paymentData.description || paymentData.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (paymentData.description && paymentData.description.length > 25) {
    errors.push('Description must be 25 characters or less');
  }
  
  if (!paymentData.packageType) {
    errors.push('Package type is required');
  }
  
  if (!paymentData.returnUrl || !paymentData.cancelUrl) {
    errors.push('Return and cancel URLs are required');
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
    
    // Prepare the request with proper formatting
    const requestBody = {
      orderCode: Math.abs(Math.floor(paymentData.orderCode)),
      userId: paymentData.userId,
      userEmail: paymentData.userEmail || '',
      packageType: paymentData.packageType,
      returnUrl: paymentData.returnUrl,
      cancelUrl: paymentData.cancelUrl,
    };
    
    console.log('📤 Sending request:', requestBody);
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
