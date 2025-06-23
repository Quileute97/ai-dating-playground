
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create PayOS signature
const createSignature = (data: string, checksumKey: string): string => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(checksumKey);
  const dataToSign = encoder.encode(data);
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => 
    crypto.subtle.sign('HMAC', key, dataToSign)
  ).then(signature => 
    Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
};

// PayOS package details with proper validation
const getPackageDetails = (packageType: string) => {
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

  return packageDetails[packageType as keyof typeof packageDetails];
};

// Generate unique orderCode with better collision avoidance
const generateUniqueOrderCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  let orderCode = parseInt(`${timestamp}${random}`.slice(-9));
  
  // Ensure it's within PayOS range and positive
  if (orderCode <= 0 || orderCode > 999999999) {
    orderCode = Math.floor(Math.random() * 899999999) + 100000000;
  }
  
  return orderCode;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('=== PayOS Payment Request Started ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { orderCode: rawOrderCode, userId, userEmail, packageType, returnUrl, cancelUrl } = requestBody;

    // Input validation
    if (!userId || !packageType) {
      throw new Error('Missing required fields: userId or packageType');
    }

    // Get package details
    const selectedPackage = getPackageDetails(packageType);
    if (!selectedPackage) {
      throw new Error(`Invalid package type: ${packageType}`);
    }

    console.log('✅ Package selected:', packageType, selectedPackage);

    // Generate or use provided orderCode
    let finalOrderCode: number;
    if (rawOrderCode && typeof rawOrderCode === 'number' && rawOrderCode > 0) {
      finalOrderCode = Math.abs(Math.floor(rawOrderCode));
      if (finalOrderCode > 999999999) {
        finalOrderCode = generateUniqueOrderCode();
      }
    } else {
      finalOrderCode = generateUniqueOrderCode();
    }

    console.log('📝 Final order code:', finalOrderCode);

    // Check PayOS credentials
    const clientId = Deno.env.get('PAYOS_CLIENT_ID');
    const apiKey = Deno.env.get('PAYOS_API_KEY');
    const checksumKey = Deno.env.get('PAYOS_CHECKSUM_KEY');
    
    if (!clientId || !apiKey || !checksumKey) {
      console.error('❌ Missing PayOS credentials');
      throw new Error('PayOS credentials not configured');
    }

    console.log('✅ PayOS credentials verified');

    // Prepare PayOS payment data according to official demo
    const paymentData = {
      orderCode: finalOrderCode,
      amount: selectedPackage.amount,
      description: selectedPackage.description,
      buyerName: userEmail ? userEmail.split('@')[0] : `User${finalOrderCode}`,
      buyerEmail: userEmail || `user${finalOrderCode}@example.com`,
      buyerPhone: "0000000000",
      buyerAddress: "Viet Nam",
      items: [
        {
          name: selectedPackage.description,
          quantity: 1,
          price: selectedPackage.amount
        }
      ],
      cancelUrl: cancelUrl || 'https://preview--ai-dating-playground.lovable.app/payment-cancel',
      returnUrl: returnUrl || 'https://preview--ai-dating-playground.lovable.app/payment-success'
    };

    console.log('✅ Payment data prepared:', JSON.stringify(paymentData, null, 2));

    // Create signature for PayOS
    const sortedData = Object.keys(paymentData)
      .filter(key => key !== 'items' && key !== 'signature')
      .sort()
      .map(key => `${key}=${paymentData[key as keyof typeof paymentData]}`)
      .join('&');
    
    console.log('🔐 Data for signature:', sortedData);
    
    const signature = await createSignature(sortedData, checksumKey);
    console.log('🔐 Generated signature:', signature);

    const finalPaymentData = {
      ...paymentData,
      signature
    };

    // Call PayOS API with proper headers and URL
    console.log('🚀 Calling PayOS API...');
    const payosResponse = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finalPaymentData),
    });

    let payosResult;
    const responseText = await payosResponse.text();
    console.log('📥 PayOS Raw Response Status:', payosResponse.status);
    console.log('📥 PayOS Raw Response Body:', responseText);
    
    try {
      payosResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse PayOS response:', parseError);
      throw new Error(`Invalid PayOS response format: ${responseText.slice(0, 200)}`);
    }

    console.log('📥 PayOS Parsed Response:', JSON.stringify(payosResult, null, 2));

    // Handle PayOS API errors
    if (!payosResponse.ok) {
      let errorMessage = `PayOS HTTP Error ${payosResponse.status}`;
      if (payosResult?.desc) {
        errorMessage += `: ${payosResult.desc}`;
      } else if (payosResult?.message) {
        errorMessage += `: ${payosResult.message}`;
      }
      console.error('❌ PayOS HTTP Error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Check for PayOS API error codes
    if (payosResult.code && payosResult.code !== '00') {
      const errorMessage = `PayOS API Error [${payosResult.code}]: ${payosResult.desc || payosResult.message || 'Unknown error'}`;
      console.error('❌ PayOS API Error:', errorMessage);
      throw new Error('Dữ liệu thanh toán không hợp lệ. Vui lòng thử lại.');
    }

    // Validate success response
    if (!payosResult.data || !payosResult.data.checkoutUrl) {
      console.error('❌ Missing checkout URL in PayOS response');
      console.error('Response data:', payosResult);
      throw new Error('PayOS response missing checkout URL');
    }

    console.log('✅ PayOS payment created successfully');

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const upgradeRequestData = {
      user_id: userId,
      user_email: userEmail || null,
      type: packageType,
      price: selectedPackage.amount,
      duration_days: selectedPackage.duration,
      expires_at: selectedPackage.duration > 0 
        ? new Date(Date.now() + selectedPackage.duration * 24 * 60 * 60 * 1000).toISOString()
        : null,
      status: 'pending',
      bank_info: {
        orderCode: finalOrderCode,
        paymentLinkId: payosResult.data.paymentLinkId,
        checkoutUrl: payosResult.data.checkoutUrl,
        amount: selectedPackage.amount,
        description: selectedPackage.description
      }
    };

    console.log('💾 Saving to database:', JSON.stringify(upgradeRequestData, null, 2));

    const { error: dbError } = await supabase
      .from('upgrade_requests')
      .insert(upgradeRequestData);

    if (dbError) {
      console.error('❌ Database error:', dbError);
      console.log('⚠️ Payment created but database save failed');
    } else {
      console.log('✅ Saved to database successfully');
    }

    const successResponse = {
      error: 0,
      message: 'Payment created successfully',
      data: {
        checkoutUrl: payosResult.data.checkoutUrl,
        orderCode: finalOrderCode,
        paymentLinkId: payosResult.data.paymentLinkId,
        amount: selectedPackage.amount,
        description: selectedPackage.description
      }
    };

    console.log('🎉 Payment creation completed successfully');
    console.log('Success response:', JSON.stringify(successResponse, null, 2));
    console.log('=== PayOS Payment Request Completed ===');

    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Payment creation failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.log('=== PayOS Payment Request Failed ===');
    
    let userFriendlyMessage = 'Có lỗi xảy ra khi tạo thanh toán';
    
    if (error.message?.includes('PayOS API Error')) {
      userFriendlyMessage = 'Dữ liệu thanh toán không hợp lệ. Vui lòng thử lại.';
    } else if (error.message?.includes('Invalid package type')) {
      userFriendlyMessage = 'Gói thanh toán không hợp lệ';
    } else if (error.message?.includes('Missing required fields')) {
      userFriendlyMessage = 'Thiếu thông tin bắt buộc';
    } else if (error.message?.includes('PayOS credentials')) {
      userFriendlyMessage = 'Cấu hình PayOS chưa đúng';
    } else if (error.message?.includes('Dữ liệu thanh toán không hợp lệ')) {
      userFriendlyMessage = error.message;
    }
    
    const errorResponse = {
      error: 1,
      message: userFriendlyMessage,
      originalError: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200, // Return 200 so frontend can handle the error properly
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
