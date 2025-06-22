
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
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1000);
  let orderCode = parseInt(`${timestamp}${random}`.slice(-9)); // Keep last 9 digits
  
  // Ensure it's within PayOS range (1-999999999)
  if (orderCode > 999999999) {
    orderCode = orderCode % 999999999;
  }
  if (orderCode <= 0) {
    orderCode = Math.floor(Math.random() * 999999999) + 1;
  }
  
  return orderCode;
};

// Validate PayOS payment data
const validatePaymentData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.orderCode || typeof data.orderCode !== 'number') {
    errors.push('Invalid orderCode: must be a positive number');
  }
  
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Invalid amount: must be a positive number');
  }
  
  if (!data.description || typeof data.description !== 'string' || data.description.length === 0) {
    errors.push('Invalid description: must be a non-empty string');
  }
  
  if (data.description && data.description.length > 25) {
    errors.push('Description too long: maximum 25 characters allowed');
  }
  
  if (!data.returnUrl || typeof data.returnUrl !== 'string') {
    errors.push('Invalid returnUrl: must be a valid URL string');
  }
  
  if (!data.cancelUrl || typeof data.cancelUrl !== 'string') {
    errors.push('Invalid cancelUrl: must be a valid URL string');
  }
  
  return errors;
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
      const error = 'Missing required fields: userId or packageType';
      console.error('❌ Validation Error:', error);
      throw new Error(error);
    }

    // Get package details
    const selectedPackage = getPackageDetails(packageType);
    if (!selectedPackage) {
      const error = `Invalid package type: ${packageType}`;
      console.error('❌ Package Error:', error);
      console.log('Available packages:', Object.keys({
        gold: true, nearby: true, nearby_week: true, nearby_month: true, 
        nearby_unlimited: true, dating_week: true, dating_month: true, dating_unlimited: true
      }));
      throw new Error(error);
    }

    console.log('✅ Package selected:', packageType, selectedPackage);

    // Generate or validate orderCode
    let finalOrderCode: number;
    if (rawOrderCode && typeof rawOrderCode === 'number') {
      finalOrderCode = Math.abs(rawOrderCode);
      if (finalOrderCode > 999999999) {
        finalOrderCode = finalOrderCode % 999999999;
      }
    } else {
      finalOrderCode = generateUniqueOrderCode();
    }

    console.log('📝 Order code generated:', finalOrderCode);

    // Prepare PayOS payment data with strict validation
    const paymentData = {
      orderCode: finalOrderCode,
      amount: Math.abs(Math.floor(selectedPackage.amount)), // Ensure positive integer
      description: selectedPackage.description.substring(0, 25), // Limit to 25 chars
      returnUrl: returnUrl || `${new URL(req.url).origin}/payment-success`,
      cancelUrl: cancelUrl || `${new URL(req.url).origin}/payment-cancel`
    };

    // Validate payment data
    const validationErrors = validatePaymentData(paymentData);
    if (validationErrors.length > 0) {
      const error = `Payment data validation failed: ${validationErrors.join(', ')}`;
      console.error('❌ Validation Errors:', validationErrors);
      throw new Error(error);
    }

    console.log('✅ Payment data validated:', JSON.stringify(paymentData, null, 2));

    // Check PayOS credentials
    const clientId = Deno.env.get('PAYOS_CLIENT_ID');
    const apiKey = Deno.env.get('PAYOS_API_KEY');
    
    if (!clientId || !apiKey) {
      console.error('❌ Missing PayOS credentials');
      throw new Error('PayOS credentials not configured');
    }

    console.log('✅ PayOS credentials verified');

    // Call PayOS API
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

    const payosResult = await payosResponse.json();
    console.log('📥 PayOS Response Status:', payosResponse.status);
    console.log('📥 PayOS Response Data:', JSON.stringify(payosResult, null, 2));

    // Handle PayOS API errors with detailed messages
    if (!payosResponse.ok || payosResult.code !== '00') {
      let errorMessage = `PayOS API Error [${payosResult.code}]: ${payosResult.desc || 'Unknown error'}`;
      
      // Add specific error guidance
      switch (payosResult.code) {
        case '20':
          errorMessage += ' - Invalid request data. Check amount, orderCode, or required fields.';
          break;
        case '21':
          errorMessage += ' - OrderCode already exists. Please try again.';
          break;
        case '22':
          errorMessage += ' - Invalid amount value.';
          break;
        case '401':
          errorMessage += ' - Invalid API credentials.';
          break;
        default:
          errorMessage += ' - Please contact support if this persists.';
      }
      
      console.error('❌ PayOS API Error:', errorMessage);
      console.error('Full error details:', {
        status: payosResponse.status,
        code: payosResult.code,
        desc: payosResult.desc,
        data: payosResult.data
      });
      
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
      throw new Error(`Database save failed: ${dbError.message}`);
    }

    console.log('✅ Saved to database successfully');

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
    console.error('Error stack:', error.stack);
    console.log('=== PayOS Payment Request Failed ===');
    
    const errorResponse = {
      error: 1,
      message: error.message || 'Payment creation failed',
      details: error.stack,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
