
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  userId?: string;
  userEmail?: string;
  packageType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paymentData: PaymentRequest = await req.json();
    
    // Get PayOS credentials from environment
    const clientId = Deno.env.get('PAYOS_CLIENT_ID');
    const apiKey = Deno.env.get('PAYOS_API_KEY');
    const checksumKey = Deno.env.get('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error('PayOS credentials not configured');
    }

    // Create signature for PayOS API
    const signatureData = `amount=${paymentData.amount}&cancelUrl=${paymentData.cancelUrl}&description=${paymentData.description}&orderCode=${paymentData.orderCode}&returnUrl=${paymentData.returnUrl}`;
    
    // Create HMAC SHA256 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(checksumKey);
    const messageData = encoder.encode(signatureData);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Call PayOS API
    const payosResponse = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderCode: paymentData.orderCode,
        amount: paymentData.amount,
        description: paymentData.description,
        returnUrl: paymentData.returnUrl,
        cancelUrl: paymentData.cancelUrl,
        signature: signatureHex,
      }),
    });

    const payosData = await payosResponse.json();
    console.log('PayOS Response:', payosData);

    if (payosData.code === '00' && payosData.data?.checkoutUrl) {
      // Save upgrade request to database
      if (paymentData.userId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabase.from('upgrade_requests').insert({
          user_id: paymentData.userId,
          user_email: paymentData.userEmail,
          type: paymentData.packageType,
          price: paymentData.amount,
          status: 'pending',
          bank_info: {
            orderCode: paymentData.orderCode,
            payos_payment_id: payosData.data.paymentLinkId
          }
        });
      }

      return new Response(JSON.stringify({
        error: 0,
        message: 'Success',
        data: {
          checkoutUrl: payosData.data.checkoutUrl,
          orderCode: paymentData.orderCode,
          paymentLinkId: payosData.data.paymentLinkId
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error(payosData.desc || 'PayOS API error');
    }

  } catch (error) {
    console.error('PayOS payment error:', error);
    return new Response(JSON.stringify({
      error: 1,
      message: error.message || 'Có lỗi xảy ra khi tạo thanh toán PayOS'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
