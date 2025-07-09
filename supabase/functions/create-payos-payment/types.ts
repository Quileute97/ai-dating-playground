
export interface PackageDetails {
  amount: number;
  description: string;
  duration: number;
}

export interface PaymentRequestBody {
  userId: string;
  userEmail?: string;
  packageType: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentData {
  orderCode: number;
  amount: number;
  description: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  returnUrl: string;
  cancelUrl: string;
  expiredAt: number;
}

export interface UpgradeRequestData {
  user_id: string;
  user_email: string | null;
  type: string;
  price: number;
  duration_days: number;
  expires_at: string | null;
  status: string;
  bank_info: {
    orderCode: number;
    paymentLinkId?: string;
    checkoutUrl: string;
    amount: number;
    description: string;
  };
}
