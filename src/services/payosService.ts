
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
  };
}

export const createPayOSPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    console.log('Creating PayOS payment:', paymentData);
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API call failed');
    }

    return result;
  } catch (error) {
    console.error('PayOS payment error:', error);
    return {
      error: 1,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo thanh toán'
    };
  }
};

export const generateOrderCode = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const createNearbyPackagePayment = async (
  packageId: string,
  userId: string,
  userEmail?: string
): Promise<PaymentResponse> => {
  try {
    console.log('Creating nearby package payment:', { packageId, userId });
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderCode: generateOrderCode(),
        userId,
        userEmail,
        packageType: packageId, // Ensure this matches what the edge function expects
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API call failed');
    }

    return result;
  } catch (error) {
    console.error('PayOS nearby package payment error:', error);
    return {
      error: 1,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo thanh toán'
    };
  }
};
