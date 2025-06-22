
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
    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));
    
    const { orderCode, userId, userEmail, packageType, returnUrl, cancelUrl } = requestBody;

    // Validate required fields
    if (!orderCode || !userId || !packageType) {
      console.error('Missing required fields:', { orderCode, userId, packageType });
      throw new Error('Missing required fields: orderCode, userId, or packageType');
    }

    // Updated package pricing and details to include all package types
    const packageDetails = {
      // Legacy packages
      'gold': { amount: 99000, description: 'Goi GOLD Premium', duration: -1 },
      'nearby': { amount: 49000, description: 'Mo rong Quanh day', duration: -1 },
      
      // New nearby packages
      'nearby_week': { amount: 20000, description: 'Premium 1 Tuan', duration: 7 },
      'nearby_month': { amount: 50000, description: 'Premium 1 Thang', duration: 30 },
      'nearby_unlimited': { amount: 500000, description: 'Premium Vo Han', duration: -1 },
      
      // New dating packages
      'dating_week': { amount: 49000, description: 'Premium Hen ho 1T', duration: 7 },
      'dating_month': { amount: 149000, description: 'Premium Hen ho 1Th', duration: 30 },
      'dating_unlimited': { amount: 399000, description: 'Premium Hen ho VH', duration: -1 }
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

    console.log('PayOS credentials found:', { clientId: clientId ? 'Set' : 'Missing', apiKey: apiKey ? 'Set' : 'Missing' });

    // Ensure orderCode is a number and within valid range (1-999999999)
    let numericOrderCode = parseInt(orderCode.toString());
    if (isNaN(numericOrderCode) || numericOrderCode <= 0) {
      numericOrderCode = Math.floor(Date.now() / 1000);
    }
    
    // Ensure orderCode is within PayOS acceptable range
    if (numericOrderCode > 999999999) {
      numericOrderCode = numericOrderCode % 999999999;
    }

    console.log('Final orderCode:', numericOrderCode);

    // Create PayOS payment with exact format required by PayOS API
    const paymentData = {
      orderCode: numericOrderCode,
      amount: selectedPackage.amount,
      description: selectedPackage.description,
      returnUrl: returnUrl || `${req.headers.get('origin')}/payment-success`,
      cancelUrl: cancelUrl || `${req.headers.get('origin')}/payment-cancel`
    };

    console.log('Sending PayOS payment request:', JSON.stringify(paymentData, null, 2));

    // Make sure we're using the correct PayOS API endpoint and headers
    const payosResponse = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    console.log('PayOS response status:', payosResponse.status);
    
    const payosResult = await payosResponse.json();
    console.log('PayOS API response:', JSON.stringify(payosResult, null, 2));

    if (!payosResponse.ok || payosResult.code !== '00') {
      console.error('PayOS API error details:', {
        status: payosResponse.status,
        code: payosResult.code,
        desc: payosResult.desc,
        data: payosResult.data
      });
      
      // Provide more specific error messages based on PayOS error codes
      let errorMessage = `PayOS API error [${payosResult.code}]: ${payosResult.desc}`;
      
      if (payosResult.code === '20') {
        errorMessage += '. Có thể do: số tiền không hợp lệ, mã đơn hàng đã tồn tại, hoặc thiếu thông tin bắt buộc.';
      } else if (payosResult.code === '21') {
        errorMessage += '. Mã đơn hàng đã tồn tại trong hệ thống.';
      } else if (payosResult.code === '22') {
        errorMessage += '. Số tiền thanh toán không hợp lệ.';
      }
      
      throw new Error(errorMessage);
    }

    // Save upgrade request to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const upgradeRequestData = {
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
        orderCode: numericOrderCode,
        paymentLinkId: payosResult.data?.paymentLinkId,
        checkoutUrl: payosResult.data?.checkoutUrl
      }
    };

    console.log('Saving upgrade request:', JSON.stringify(upgradeRequestData, null, 2));

    const { error: dbError } = await supabase
      .from('upgrade_requests')
      .insert(upgradeRequestData);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save upgrade request: ' + dbError.message);
    }

    const successResponse = {
      error: 0,
      message: 'success',
      data: {
        checkoutUrl: payosResult.data?.checkoutUrl,
        orderCode: numericOrderCode,
        paymentLinkId: payosResult.data?.paymentLinkId,
      }
    };

    console.log('Returning success response:', JSON.stringify(successResponse, null, 2));

    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Create payment error:', error);
    console.error('Error stack:', error.stack);
    
    const errorResponse = {
      error: 1,
      message: error.message || 'Payment creation failed',
      details: error.stack
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
