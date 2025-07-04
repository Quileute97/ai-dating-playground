
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

    // Generate orderCode with better validation
    const orderCode = generateOrderCode();
    console.log('📝 Generated order code:', orderCode);

    // Validate orderCode is within PayOS limits (1-9999999999)
    if (orderCode < 1 || orderCode > 9999999999) {
      throw new Error(`Invalid order code: ${orderCode}. Must be between 1 and 9999999999`);
    }

    // Create payment data with proper validation
    const paymentData = createPaymentData(
      orderCode,
      selectedPackage,
      userEmail,
      returnUrl,
      cancelUrl
    );

    // Additional PayOS format validation
    if (!paymentData.buyerName || paymentData.buyerName.trim().length === 0) {
      paymentData.buyerName = 'Customer';
    }
    
    if (!paymentData.buyerEmail || !paymentData.buyerEmail.includes('@')) {
      paymentData.buyerEmail = 'customer@example.com';
    }

    // Ensure description contains only allowed characters
    paymentData.description = paymentData.description
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .substring(0, 25);

    if (!paymentData.description) {
      paymentData.description = 'Premium Package';
    }

    // Validate amount is positive integer
    if (!Number.isInteger(paymentData.amount) || paymentData.amount <= 0) {
      throw new Error(`Invalid amount: ${paymentData.amount}. Must be positive integer`);
    }

    // Ensure items array is properly formatted with clean data
    paymentData.items = [{
      name: paymentData.description.substring(0, 20).trim() || 'Premium',
      quantity: 1,
      price: paymentData.amount
    }];

    // Validate expiredAt is in future and reasonable
    const now = Math.floor(Date.now() / 1000);
    if (paymentData.expiredAt <= now || paymentData.expiredAt > now + (24 * 60 * 60)) {
      paymentData.expiredAt = now + (15 * 60); // 15 minutes from now
    }

    // Clean URLs to ensure they're valid
    if (!paymentData.returnUrl || !paymentData.returnUrl.startsWith('http')) {
      paymentData.returnUrl = 'https://preview--ai-dating-playground.lovable.app/payment-success';
    }
    
    if (!paymentData.cancelUrl || !paymentData.cancelUrl.startsWith('http')) {
      paymentData.cancelUrl = 'https://preview--ai-dating-playground.lovable.app/payment-cancel';
    }

    console.log('✅ Payment data prepared and validated:', JSON.stringify(paymentData, null, 2));

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
