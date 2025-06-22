
export interface DatingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // days, -1 for unlimited
  features: string[];
}

export const DATING_PACKAGES: DatingPackage[] = [
  {
    id: 'dating_week',
    name: 'Premium 1 Tuần',
    description: 'Trải nghiệm premium trong 7 ngày',
    price: 49000,
    duration: 7,
    features: [
      'Không giới hạn lượt swipe',
      'Xem ai đã thích bạn',
      'Super Like không giới hạn',
      'Boost hồ sơ 1 lần/ngày',
      'Ẩn quảng cáo'
    ]
  },
  {
    id: 'dating_month',
    name: 'Premium 1 Tháng',
    description: 'Gói phổ biến nhất cho trải nghiệm tối ưu',
    price: 149000,
    duration: 30,
    features: [
      'Tất cả tính năng gói tuần',
      'Rewind không giới hạn',
      'Passport - Đổi vị trí',
      'Read receipts',
      'Top Picks hàng ngày',
      'Hỗ trợ ưu tiên'
    ]
  },
  {
    id: 'dating_unlimited',
    name: 'Premium Vĩnh Viễn',
    description: 'Sở hữu tất cả tính năng premium mãi mãi',
    price: 399000,
    duration: -1,
    features: [
      'Tất cả tính năng premium',
      'Không giới hạn thời gian',
      'Badge Premium đặc biệt',
      'Ưu tiên hiển thị tối đa',
      'Tính năng mới được cập nhật miễn phí',
      'Hỗ trợ VIP 24/7'
    ]
  }
];

// Validate package data before sending
const validatePackageRequest = (packageId: string, userId: string) => {
  if (!packageId || typeof packageId !== 'string') {
    throw new Error('Package ID không hợp lệ');
  }
  
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID không hợp lệ');
  }
  
  const selectedPackage = DATING_PACKAGES.find(pkg => pkg.id === packageId);
  if (!selectedPackage) {
    throw new Error(`Gói ${packageId} không tồn tại`);
  }
  
  return selectedPackage;
};

// Generate unique order code with collision avoidance
const generateOrderCode = () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1000);
  return parseInt(`${timestamp}${random}`.slice(-9));
};

export const createDatingPackagePayment = async (
  packageId: string,
  userId: string,
  userEmail?: string
) => {
  try {
    console.log('🚀 Creating dating package payment:', { packageId, userId, userEmail });
    
    // Validate input data
    const selectedPackage = validatePackageRequest(packageId, userId);
    console.log('✅ Package validated:', selectedPackage);
    
    // Generate unique order code
    const orderCode = generateOrderCode();
    console.log('📝 Generated order code:', orderCode);
    
    const requestData = {
      orderCode: orderCode,
      userId: userId,
      userEmail: userEmail || '',
      packageType: packageId,
      returnUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/payment-cancel`,
    };
    
    console.log('📤 Sending payment request:', requestData);
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      throw new Error('Lỗi phản hồi từ server không hợp lệ');
    }
    
    console.log('📥 PayOS response:', {
      status: response.status,
      ok: response.ok,
      result: result
    });
    
    if (!response.ok) {
      const errorMessage = result?.message || `HTTP Error ${response.status}`;
      console.error('❌ API call failed:', errorMessage);
      throw new Error(errorMessage);
    }

    if (result.error && result.error !== 0) {
      console.error('❌ PayOS error response:', result);
      throw new Error(result.message || 'Lỗi từ PayOS API');
    }
    
    console.log('✅ Payment created successfully:', result.data);
    return result;

  } catch (error) {
    console.error('💥 PayOS dating package payment error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Có lỗi xảy ra khi tạo thanh toán';
    
    if (error.message?.includes('PayOS API Error [20]')) {
      userMessage = 'Dữ liệu thanh toán không hợp lệ. Vui lòng thử lại.';
    } else if (error.message?.includes('PayOS API Error [21]')) {
      userMessage = 'Mã đơn hàng đã tồn tại. Vui lòng thử lại.';
    } else if (error.message?.includes('PayOS API Error [22]')) {
      userMessage = 'Số tiền thanh toán không hợp lệ.';
    } else if (error.message?.includes('PayOS credentials')) {
      userMessage = 'Lỗi cấu hình hệ thống thanh toán. Vui lòng liên hệ hỗ trợ.';
    } else if (error.message?.includes('Network')) {
      userMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    return {
      error: 1,
      message: userMessage,
      originalError: error.message
    };
  }
};
