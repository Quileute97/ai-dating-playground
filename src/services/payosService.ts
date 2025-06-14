
export interface PaymentData {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  error: number;
  message: string;
  data?: {
    checkoutUrl: string;
    orderCode: number;
  };
}

export const createPayOSPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    // Simulate PayOS API call
    console.log('Creating PayOS payment:', paymentData);
    
    // Mock response - in real implementation, you would call PayOS API
    const mockResponse: PaymentResponse = {
      error: 0,
      message: "Success",
      data: {
        checkoutUrl: `https://payos.vn/checkout/${paymentData.orderCode}`,
        orderCode: paymentData.orderCode
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockResponse;
  } catch (error) {
    console.error('PayOS payment error:', error);
    return {
      error: 1,
      message: 'Có lỗi xảy ra khi tạo thanh toán'
    };
  }
};

export const generateOrderCode = (): number => {
  return Math.floor(Date.now() / 1000);
};
