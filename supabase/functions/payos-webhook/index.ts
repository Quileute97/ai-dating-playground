import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayOSWebhookData {
  code: string;
  desc: string;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId?: string;
    counterAccountBankName?: string;
    counterAccountName?: string;
    counterAccountNumber?: string;
    virtualAccountName?: string;
    virtualAccountNumber?: string;
  };
  signature: string;
}

const PACKAGE_DURATIONS = {
  'dating_week': 7,
  'dating_month': 30, 
  'dating_lifetime': -1, // Vĩnh viễn
  'nearby_week': 7,
  'nearby_month': 30,
  'nearby_lifetime': -1
};

const STAR_PACKAGES: Record<string, number> = {
  'stars_10': 10,
  'stars_50': 50,
  'stars_100': 100,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client with service role key for admin operations
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    console.log('🔄 PayOS Webhook received');
    
    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get('PAYOS_WEBHOOK_SECRET');
    if (webhookSecret) {
      const providedSignature = req.headers.get('x-payos-signature');
      
      if (!providedSignature) {
        console.error('❌ Missing webhook signature');
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Create HMAC signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(rawBody)
      );
      
      const computedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (computedSignature !== providedSignature) {
        console.error('❌ Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ PAYOS_WEBHOOK_SECRET not configured - skipping signature verification');
    }
    
    const webhookData: PayOSWebhookData = JSON.parse(rawBody);
    console.log('📦 Webhook data:', JSON.stringify(webhookData, null, 2));

    const { data: webhookPayload } = webhookData;
    
    if (!webhookPayload || !webhookPayload.orderCode) {
      console.error('❌ Invalid webhook payload');
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Only process successful payments
    if (webhookData.code !== '00' || webhookPayload.code !== '00') {
      console.log('⚠️ Payment not successful, code:', webhookData.code);
      return new Response(JSON.stringify({ status: 'ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Payment successful, processing...');

    // Find the invoice in our database
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('payos_invoices')
      .select('*')
      .eq('order_code', webhookPayload.orderCode)
      .single();

    if (invoiceError || !invoice) {
      console.error('❌ Invoice not found:', invoiceError);
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📄 Found invoice:', invoice);

    // Update invoice status to paid
    const { error: updateInvoiceError } = await supabaseAdmin
      .from('payos_invoices')
      .update({
        status: 'PAID',
        payos_data: webhookPayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    if (updateInvoiceError) {
      console.error('❌ Failed to update invoice:', updateInvoiceError);
    } else {
      console.log('✅ Invoice updated to PAID');
    }

    // Extract package type from description
    let packageType = '';
    if (invoice.description) {
      if (invoice.description.includes('Premium 1 thang')) {
        packageType = 'dating_month';
      } else if (invoice.description.includes('Premium 1 tuan')) {
        packageType = 'dating_week';  
      } else if (invoice.description.includes('Premium Vinh vien') || invoice.description.includes('Premium vinh vien')) {
        packageType = 'dating_lifetime';
      } else if (invoice.description.includes('Nearby 1 thang')) {
        packageType = 'nearby_month';
      } else if (invoice.description.includes('Nearby 1 tuan')) {
        packageType = 'nearby_week';
      } else if (invoice.description.includes('Nearby Vinh vien') || invoice.description.includes('Nearby vinh vien')) {
        packageType = 'nearby_lifetime';
      } else if (invoice.description.includes('Nap 10 sao')) {
        packageType = 'stars_10';
      } else if (invoice.description.includes('Nap 50 sao')) {
        packageType = 'stars_50';
      } else if (invoice.description.includes('Nap 100 sao')) {
        packageType = 'stars_100';
      }
    }

    if (!packageType) {
      console.error('❌ Could not determine package type from description:', invoice.description);
      return new Response(JSON.stringify({ error: 'Unknown package type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📦 Package type:', packageType);

    // Handle STAR packages
    if (packageType in STAR_PACKAGES) {
      const starAmount = STAR_PACKAGES[packageType];
      console.log(`⭐ Processing star purchase: ${starAmount} stars for user ${invoice.user_id}`);

      // Upsert user_stars balance
      const { data: existing } = await supabaseAdmin
        .from('user_stars')
        .select('id, balance')
        .eq('user_id', invoice.user_id)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin.from('user_stars').update({
          balance: existing.balance + starAmount,
          updated_at: new Date().toISOString()
        }).eq('user_id', invoice.user_id);
      } else {
        await supabaseAdmin.from('user_stars').insert({
          user_id: invoice.user_id,
          balance: starAmount
        });
      }

      // Record transaction
      await supabaseAdmin.from('star_transactions').insert({
        user_id: invoice.user_id,
        type: 'purchase',
        amount: starAmount,
        order_code: webhookPayload.orderCode.toString(),
        note: `Mua ${starAmount} sao qua PayOS`
      });

      console.log(`✅ Added ${starAmount} stars to user ${invoice.user_id}`);

      return new Response(JSON.stringify({ 
        status: 'success',
        message: `Added ${starAmount} stars`,
        packageType
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle PREMIUM packages (existing logic)
    const durationDays = PACKAGE_DURATIONS[packageType as keyof typeof PACKAGE_DURATIONS];
    let premiumExpires = null;
    
    if (durationDays !== -1) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + durationDays);
      premiumExpires = expirationDate.toISOString();
    }

    console.log('⏰ Premium expires:', premiumExpires || 'Never (lifetime)');

    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: true,
        premium_expires: premiumExpires,
        last_active: new Date().toISOString()
      })
      .eq('id', invoice.user_id);

    if (updateProfileError) {
      console.error('❌ Failed to update user profile:', updateProfileError);
      return new Response(JSON.stringify({ error: 'Failed to activate premium' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ User premium status activated');

    const { error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: invoice.user_id,
        package_type: packageType,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: premiumExpires,
        payment_amount: invoice.amount,
        order_code: webhookPayload.orderCode.toString()
      }, {
        onConflict: 'user_id,package_type'
      });

    if (subscriptionError) {
      console.error('❌ Failed to create subscription record:', subscriptionError);
    } else {
      console.log('✅ Subscription record created');
    }

    return new Response(JSON.stringify({ 
      status: 'success',
      message: 'Premium activated successfully',
      packageType,
      expiresAt: premiumExpires
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Webhook processing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});