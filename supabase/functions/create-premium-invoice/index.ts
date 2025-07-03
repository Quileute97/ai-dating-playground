
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYOS_API_URL = "https://api-merchant.payos.vn/v2/payment-requests";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, plan_type = 'premium_monthly' } = await req.json();
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('Creating premium invoice for user:', user_id);

    // Cấu hình gói Premium
    const PREMIUM_PLANS = {
      'premium_monthly': {
        amount: 99000,
        description: 'Nâng cấp Premium 30 ngày',
        duration_days: 30
      },
      'premium_yearly': {
        amount: 999000,
        description: 'Nâng cấp Premium 365 ngày',
        duration_days: 365
      }
    };

    const plan = PREMIUM_PLANS[plan_type];
    if (!plan) {
      throw new Error('Invalid plan type');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Tạo orderCode unique
    const orderCode = Math.floor(Date.now() / 1000);
    
    // Cấu hình PayOS
    const CLIENT_ID = Deno.env.get('PAYOS_CLIENT_ID');
    const API_KEY = Deno.env.get('PAYOS_API_KEY');
    const CHECKSUM_KEY = Deno.env.get('PAYOS_CHECKSUM_KEY');

    if (!CLIENT_ID || !API_KEY || !CHECKSUM_KEY) {
      throw new Error('PayOS configuration missing');
    }

    const origin = req.headers.get('origin') || 'https://your-app.com';
    const returnUrl = `${origin}/payment-success?orderCode=${orderCode}`;
    const cancelUrl = `${origin}/payment-cancel?orderCode=${orderCode}`;

    // Tạo checksum
    const dataStr = `amount=${plan.amount}&cancelUrl=${cancelUrl}&description=${plan.description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    const signature = await createSignature(dataStr, CHECKSUM_KEY);

    const paymentData = {
      orderCode: orderCode,
      amount: plan.amount,
      description: plan.description,
      returnUrl: returnUrl,
      cancelUrl: cancelUrl,
      signature: signature
    };

    console.log('Sending PayOS request:', paymentData);

    // Gọi API PayOS
    const response = await fetch(PAYOS_API_URL, {
      method: 'POST',
      headers: {
        'x-client-id': CLIENT_ID,
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const responseData = await response.json();
    console.log('PayOS response:', responseData);

    if (!response.ok) {
      throw new Error(responseData.desc || 'PayOS API error');
    }

    // Lưu hóa đơn vào database
    const { error: insertError } = await supabase
      .from('payos_invoices')
      .insert({
        user_id: user_id,
        order_code: orderCode,
        amount: plan.amount,
        description: plan.description,
        status: 'PENDING',
        payos_data: responseData
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({
      success: true,
      checkoutUrl: responseData.data?.checkoutUrl,
      orderCode: orderCode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating premium invoice:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create invoice'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createSignature(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataToSign = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
