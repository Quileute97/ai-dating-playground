
import { PaymentData } from './types.ts';

export class PayOSClient {
  private clientId: string;
  private apiKey: string;
  private checksumKey: string;

  constructor() {
    this.clientId = Deno.env.get('PAYOS_CLIENT_ID') || '';
    this.apiKey = Deno.env.get('PAYOS_API_KEY') || '';
    this.checksumKey = Deno.env.get('PAYOS_CHECKSUM_KEY') || '';
  }

  validateCredentials(): boolean {
    return !!(this.clientId && this.apiKey && this.checksumKey);
  }

  async createPayment(paymentData: PaymentData) {
    console.log('🚀 Calling PayOS API...');
    
    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': this.clientId,
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData),
    });

    console.log('📥 PayOS Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('📥 PayOS Response Body:', responseText);
    
    let payosResult;
    try {
      payosResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse PayOS response:', parseError);
      throw new Error(`Invalid PayOS response format: ${responseText.slice(0, 200)}`);
    }

    console.log('📥 PayOS Parsed Response:', JSON.stringify(payosResult, null, 2));

    // Handle PayOS errors
    if (!response.ok) {
      let errorMessage = `PayOS HTTP Error ${response.status}`;
      if (payosResult?.desc || payosResult?.message) {
        errorMessage += `: ${payosResult.desc || payosResult.message}`;
      }
      console.error('❌ PayOS HTTP Error:', errorMessage);
      throw new Error('Lỗi kết nối PayOS. Vui lòng thử lại.');
    }

    // Check PayOS result code (should be '00' for success)
    if (payosResult.code && payosResult.code !== '00') {
      const errorMessage = `PayOS Error [${payosResult.code}]: ${payosResult.desc || payosResult.message || 'Unknown error'}`;
      console.error('❌ PayOS API Error:', errorMessage);
      throw new Error(`PayOS API Error: ${payosResult.desc || payosResult.message || 'Unknown error'}`);
    }

    // Validate response structure
    if (!payosResult.data?.checkoutUrl) {
      console.error('❌ Missing checkout URL in response');
      console.error('Response data:', payosResult);
      throw new Error('PayOS không trả về URL thanh toán');
    }

    console.log('✅ PayOS payment created successfully');
    console.log('✅ Checkout URL:', payosResult.data.checkoutUrl);

    return payosResult;
  }
}
