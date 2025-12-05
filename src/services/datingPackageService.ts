
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
  const selectedPackage = DATING_PACKAGES.find(pkg => pkg.id === packageId);
  if (!selectedPackage) {
    throw new Error('Gói không tồn tại');
  }

  try {
    console.log('Creating dating package payment:', { packageId, userId });
    
    const response = await fetch('https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/create-payos-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderCode: Math.floor(Date.now() / 1000),
        amount: selectedPackage.price,
        description: `Goi ${selectedPackage.name}`,
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
        userId,
        userEmail,
        packageType: packageId,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API call failed');
    }

    return result;
  } catch (error) {
    console.error('PayOS dating package payment error:', error);
    return {
      error: 1,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo thanh toán'
    };
  }
};
