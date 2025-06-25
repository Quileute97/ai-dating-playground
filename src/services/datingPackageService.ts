
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

export const createDatingPackagePayment = async (
  packageId: string,
  userId: string,
  userEmail?: string
) => {
  try {
    console.log('🚀 Creating dating package payment:', { packageId, userId, userEmail });
    
    // Strict validation
    if (!packageId || typeof packageId !== 'string' || packageId.trim() === '') {
      throw new Error('Package ID không hợp lệ');
    }
    
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('User ID không hợp lệ');
    }
    
    const selectedPackage = DATING_PACKAGES.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      throw new Error(`Gói ${packageId} không tồn tại`);
    }
    
    console.log('✅ Package validated:', selectedPackage);
    
    // Generate unique orderCode following PayOS requirements (max 9999999999)
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.floor(Math.random() * 999) + 1;
    let orderCode = parseInt(`${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`);
    
    // Ensure orderCode is within PayOS limits
    if (orderCode > 9999999999 || orderCode <= 0) {
      orderCode = Math.floor(Math.random() * 999999999) + 100000000;
    }
    
    console.log('📝 Generated order code:', orderCode);
    
    // Prepare request data
    const requestData = {
      orderCode: orderCode,
      userId: userId.trim(),
      userEmail: userEmail?.trim() || '',
      packageType: packageId,
      returnUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/payment-cancel`,
    };
    
    console.log('📤 Sending payment request:', requestData);
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData),
    });

    console.log('📥 Response status:', response.status, response.ok);

    let result;
    try {
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      throw new Error('Phản hồi từ server không hợp lệ');
    }
    
    console.log('📥 Parsed response:', result);
    
    // Handle error responses
    if (result.error && result.error !== 0) {
      console.error('❌ API error response:', result);
      throw new Error(result.message || 'Có lỗi xảy ra khi tạo thanh toán');
    }
    
    // Validate success response structure
    if (!result.data || !result.data.checkoutUrl) {
      console.error('❌ Invalid success response:', result);
      throw new Error('Không nhận được URL thanh toán');
    }
    
    console.log('✅ Payment created successfully:', result.data);
    return result;

  } catch (error) {
    console.error('💥 PayOS dating package payment error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Có lỗi xảy ra khi tạo thanh toán';
    
    if (error.message?.includes('Package ID không hợp lệ')) {
      userMessage = 'Gói thanh toán không hợp lệ';
    } else if (error.message?.includes('User ID không hợp lệ')) {
      userMessage = 'Thông tin người dùng không hợp lệ';
    } else if (error.message?.includes('không tồn tại')) {
      userMessage = 'Gói thanh toán không tồn tại';
    } else if (error.message?.includes('Dữ liệu thanh toán không hợp lệ')) {
      userMessage = error.message;
    } else if (error.message?.includes('Phản hồi từ server')) {
      userMessage = 'Lỗi kết nối với server. Vui lòng thử lại.';
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
