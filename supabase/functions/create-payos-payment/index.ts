
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('=== PayOS Payment Request Started ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { userId, userEmail, packageType, returnUrl, cancelUrl } = requestBody;

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

    // Check PayOS credentials first
    const clientId = Deno.env.get('PAYOS_CLIENT_ID');
    const apiKey = Deno.env.get('PAYOS_API_KEY');
    const checksumKey = Deno.env.get('PAYOS_CHECKSUM_KEY');
    
    if (!clientId || !apiKey || !checksumKey) {
      console.error('❌ Missing PayOS credentials');
      throw new Error('PayOS credentials not configured');
    }

    console.log('✅ PayOS credentials verified');

    // Generate orderCode theo đúng format PayOS (number, không quá 9 chữ số)
    const timestamp = Date.now();
    const orderCode = parseInt(timestamp.toString().slice(-8)); // Lấy 8 chữ số cuối
    console.log('📝 Generated order code:', orderCode);

    // Tạo payment data theo đúng format PayOS API v2
    const paymentData = {
      orderCode,
      amount: selectedPackage.amount,
      description: selectedPackage.description,
      items: [{
        name: selectedPackage.description,
        quantity: 1,
        price: selectedPackage.amount
      }],
      returnUrl: returnUrl || 'https://preview--ai-dating-playground.lovable.app/payment-success',
      cancelUrl: cancelUrl || 'https://preview--ai-dating-playground.lovable.app/payment-cancel'
    };

    console.log('✅ Payment data prepared:', JSON.stringify(paymentData, null, 2));

    // Call PayOS API với headers chính xác
    console.log('🚀 Calling PayOS API...');
    const payosResponse = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData),
    });

    console.log('📥 PayOS Response Status:', payosResponse.status);
    
    const responseText = await payosResponse.text();
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
    if (!payosResponse.ok) {
      let errorMessage = `PayOS HTTP Error ${payosResponse.status}`;
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
        orderCode: orderCode,
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
        orderCode: orderCode,
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
      userFriendlyMessage = `Lỗi PayOS: ${error.message.split(': ')[1] || 'Vui lòng thử lại'}`;
    } else if (error.message?.includes('Invalid package type')) {
      userFriendlyMessage = 'Gói thanh toán không hợp lệ';
    } else if (error.message?.includes('Missing required fields')) {
      userFriendlyMessage = 'Thiếu thông tin bắt buộc';
    } else if (error.message?.includes('PayOS credentials')) {
      userFriendlyMessage = 'Cấu hình PayOS chưa đúng';
    } else if (error.message?.includes('Lỗi kết nối PayOS')) {
      userFriendlyMessage = error.message;
    } else if (error.message?.includes('PayOS không trả về URL')) {
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
