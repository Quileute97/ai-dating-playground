
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderCode, userId, userEmail, packageType, returnUrl, cancelUrl } = await req.json();

    // Updated package pricing and details to include all package types
    const packageDetails = {
      // Legacy packages
      'gold': { amount: 99000, description: 'Gói GOLD - Không giới hạn match', duration: -1 },
      'nearby': { amount: 49000, description: 'Gói Mở rộng Quanh đây - Cũ', duration: -1 },
      
      // New nearby packages
      'nearby_week': { amount: 20000, description: 'Gói Premium 1 Tuần - Mở rộng phạm vi 20km', duration: 7 },
      'nearby_month': { amount: 50000, description: 'Gói Premium 1 Tháng - Mở rộng phạm vi 20km', duration: 30 },
      'nearby_unlimited': { amount: 500000, description: 'Gói Premium Vô Hạn - Mở rộng phạm vi 20km', duration: -1 },
      
      // New dating packages
      'dating_week': { amount: 49000, description: 'Gói Premium 1 Tuần - Hẹn hò không giới hạn', duration: 7 },
      'dating_month': { amount: 149000, description: 'Gói Premium 1 Tháng - Hẹn hò không giới hạn', duration: 30 },
      'dating_unlimited': { amount: 399000, description: 'Gói Premium Vĩnh Viễn - Hẹn hò không giới hạn', duration: -1 }
    };

    const selectedPackage = packageDetails[packageType as keyof typeof packageDetails];
    if (!selectedPackage) {
      console.error('Invalid package type:', packageType);
      console.error('Available packages:', Object.keys(packageDetails));
      throw new Error(`Invalid package type: ${packageType}`);
    }

    // Check if required environment variables are set
    const clientId = Deno.env.get('PAYOS_CLIENT_ID');
    const apiKey = Deno.env.get('PAYOS_API_KEY');
    
    if (!clientId || !apiKey) {
      console.error('Missing PayOS credentials');
      throw new Error('PayOS credentials not configured');
    }

    // Create PayOS payment with minimal required fields only
    const paymentData = {
      orderCode: parseInt(orderCode.toString()),
      amount: selectedPackage.amount,
      description: `Premium ${packageType}`,
      returnUrl: returnUrl || `${req.headers.get('origin')}/payment-success`,
      cancelUrl: cancelUrl || `${req.headers.get('origin')}/payment-cancel`
    };

    console.log('Creating PayOS payment with minimal data:', paymentData);

    const payosResponse = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const payosResult = await payosResponse.json();
    console.log('PayOS API response:', JSON.stringify(payosResult, null, 2));

    if (!payosResponse.ok) {
      console.error('PayOS HTTP error:', {
        status: payosResponse.status,
        statusText: payosResponse.statusText,
        headers: Object.fromEntries(payosResponse.headers.entries())
      });
      throw new Error(`PayOS HTTP error: ${payosResponse.status} ${payosResponse.statusText}`);
    }

    if (payosResult.code !== '00') {
      console.error('PayOS API error details:', {
        code: payosResult.code,
        desc: payosResult.desc,
        data: payosResult.data
      });
      throw new Error(`PayOS API error [${payosResult.code}]: ${payosResult.desc || 'Unknown error'}`);
    }

    // Save upgrade request to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabase
      .from('upgrade_requests')
      .insert({
        user_id: userId,
        user_email: userEmail,
        type: packageType,
        price: selectedPackage.amount,
        duration_days: selectedPackage.duration,
        expires_at: selectedPackage.duration > 0 
          ? new Date(Date.now() + selectedPackage.duration * 24 * 60 * 60 * 1000).toISOString()
          : null,
        status: 'pending',
        bank_info: {
          orderCode: parseInt(orderCode.toString()),
          paymentLinkId: payosResult.data?.paymentLinkId,
          checkoutUrl: payosResult.data?.checkoutUrl
        }
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save upgrade request');
    }

    return new Response(JSON.stringify({
      error: 0,
      message: 'success',
      data: {
        checkoutUrl: payosResult.data?.checkoutUrl,
        orderCode: parseInt(orderCode.toString()),
        paymentLinkId: payosResult.data?.paymentLinkId,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return new Response(JSON.stringify({
      error: 1,
      message: error.message || 'Payment creation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
