
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { PaymentRequestBody } from './types.ts';
import { getPackageDetails } from './packages.ts';
import { PayOSClient } from './payos-client.ts';
import { saveUpgradeRequest } from './database.ts';
import { 
  generateOrderCode, 
  createPaymentData, 
  createUpgradeRequestData,
  validateInput,
  createErrorResponse
} from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: PaymentRequestBody = await req.json();
    console.log('=== PayOS Payment Request Started ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { userId, userEmail, packageType, returnUrl, cancelUrl } = requestBody;

    // Input validation
    validateInput(userId, packageType);

    // Get package details
    const selectedPackage = getPackageDetails(packageType);
    if (!selectedPackage) {
      throw new Error(`Invalid package type: ${packageType}`);
    }

    console.log('✅ Package selected:', packageType, selectedPackage);

    // Initialize PayOS client and validate credentials
    const payosClient = new PayOSClient();
    if (!payosClient.validateCredentials()) {
      console.error('❌ Missing PayOS credentials');
      throw new Error('PayOS credentials not configured');
    }

    console.log('✅ PayOS credentials verified');

    // Generate orderCode
    const orderCode = generateOrderCode();
    console.log('📝 Generated order code:', orderCode);

    // Create payment data
    const paymentData = createPaymentData(
      orderCode,
      selectedPackage,
      userEmail,
      returnUrl,
      cancelUrl
    );

    console.log('✅ Payment data prepared:', JSON.stringify(paymentData, null, 2));

    // Call PayOS API
    const payosResult = await payosClient.createPayment(paymentData);

    // Save to database
    const upgradeRequestData = createUpgradeRequestData(
      userId,
      userEmail,
      packageType,
      selectedPackage,
      orderCode,
      payosResult
    );

    await saveUpgradeRequest(upgradeRequestData);

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
    const errorResponse = createErrorResponse(error as Error);
    
    return new Response(JSON.stringify(errorResponse), {
      status: 200, // Return 200 so frontend can handle the error properly
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
