
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

// Generate unique orderCode with collision avoidance
const generateUniqueOrderCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  let orderCode = parseInt(`${timestamp}${random}`.slice(-9));
  
  // Ensure it's within PayOS range (1-9007199254740991)
  if (orderCode <= 0) {
    orderCode = Math.floor(Math.random() * 999999999) + 1;
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

    // Generate or validate orderCode
    let finalOrderCode: number;
    if (rawOrderCode && typeof rawOrderCode === 'number' && rawOrderCode > 0) {
      finalOrderCode = Math.abs(Math.floor(rawOrderCode));
    } else {
      finalOrderCode = generateUniqueOrderCode();
    }

    console.log('📝 Order code generated:', finalOrderCode);

    // Prepare PayOS payment data according to their exact API spec
    const paymentData = {
      orderCode: finalOrderCode,
      amount: selectedPackage.amount,
      description: selectedPackage.description,
      returnUrl: returnUrl || `${new URL(req.url).origin}/payment-success`,
      cancelUrl: cancelUrl || `${new URL(req.url).origin}/payment-cancel`
    };

    console.log('✅ Payment data prepared:', JSON.stringify(paymentData, null, 2));

    // Check PayOS credentials
    const clientId = Deno.env.get('PAYOS_CLIENT_ID');
    const apiKey = Deno.env.get('PAYOS_API_KEY');
    
    if (!clientId || !apiKey) {
      console.error('❌ Missing PayOS credentials');
      throw new Error('PayOS credentials not configured');
    }

    console.log('✅ PayOS credentials verified');

    // Call PayOS API with exact headers they expect
    console.log('🚀 Calling PayOS API...');
    const payosResponse = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    let payosResult;
    const responseText = await payosResponse.text();
    console.log('📥 PayOS Raw Response:', responseText);
    
    try {
      payosResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse PayOS response:', parseError);
      throw new Error(`Invalid PayOS response: ${responseText}`);
    }

    console.log('📥 PayOS Response Status:', payosResponse.status);
    console.log('📥 PayOS Response Data:', JSON.stringify(payosResult, null, 2));

    // Handle PayOS API errors
    if (!payosResponse.ok || (payosResult.code && payosResult.code !== '00')) {
      let errorMessage = `PayOS API Error`;
      
      if (payosResult.code) {
        errorMessage += ` [${payosResult.code}]: ${payosResult.desc || 'Unknown error'}`;
      } else {
        errorMessage += `: HTTP ${payosResponse.status}`;
      }
      
      console.error('❌ PayOS API Error:', errorMessage);
      console.error('Full error details:', payosResult);
      
      throw new Error(errorMessage);
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
        paymentLinkId: payosResult.data?.paymentLinkId,
        checkoutUrl: payosResult.data?.checkoutUrl,
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
      // Don't throw here - payment was created successfully
      console.log('⚠️ Payment created but database save failed');
    } else {
      console.log('✅ Saved to database successfully');
    }

    const successResponse = {
      error: 0,
      message: 'Payment created successfully',
      data: {
        checkoutUrl: payosResult.data?.checkoutUrl,
        orderCode: finalOrderCode,
        paymentLinkId: payosResult.data?.paymentLinkId,
        amount: selectedPackage.amount,
        description: selectedPackage.description
      }
    };

    console.log('🎉 Payment creation completed successfully');
    console.log('Response:', JSON.stringify(successResponse, null, 2));
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
    
    const errorResponse = {
      error: 1,
      message: error.message || 'Payment creation failed',
      originalError: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
