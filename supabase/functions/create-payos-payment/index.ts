import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  packageType: string;
  userId: string;
  userEmail?: string;
  orderCode?: number;
  returnUrl?: string;
  cancelUrl?: string;
}

interface PackageInfo {
  name: string;
  price: number;
  description: string; // Max 25 characters for PayOS
}

function getPackageInfo(packageType: string): PackageInfo | null {
  const packages: Record<string, PackageInfo> = {
    // Dating packages
    "dating_week": {
      name: "Premium 1 tuần",
      price: 50000,
      description: "Premium 1 tuan" // 14 chars
    },
    "dating_month": {
      name: "Premium 1 tháng", 
      price: 150000,
      description: "Premium 1 thang" // 15 chars
    },
    "dating_lifetime": {
      name: "Premium vĩnh viễn",
      price: 500000,
      description: "Premium vinh vien" // 17 chars
    },
    // Nearby packages
    "nearby_week": {
      name: "Nearby 1 tuần",
      price: 20000,
      description: "Nearby 1 tuan" // 13 chars
    },
    "nearby_month": {
      name: "Nearby 1 tháng",
      price: 50000,
      description: "Nearby 1 thang" // 14 chars
    },
    "nearby_unlimited": {
      name: "Nearby vĩnh viễn", 
      price: 500000,
      description: "Nearby vinh vien" // 16 chars
    }
  };

  return packages[packageType] || null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Creating PayOS payment...");

    // Get PayOS credentials from environment
    const clientId = Deno.env.get("PAYOS_CLIENT_ID");
    const apiKey = Deno.env.get("PAYOS_API_KEY");
    const checksumKey = Deno.env.get("PAYOS_CHECKSUM_KEY");

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error("PayOS credentials not configured");
    }

    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log("✅ User authenticated:", user.email);

    // Parse request body
    const body: PaymentRequest = await req.json();
    const { packageType, userId, userEmail } = body;

    console.log("📝 Received payment request:", { packageType, userId, userEmail });

    // Get package info based on packageType
    const packageInfo = getPackageInfo(packageType);
    if (!packageInfo) {
      throw new Error(`Invalid package type: ${packageType}`);
    }

    const { name, price: amount, description } = packageInfo;
    console.log("📦 Package info:", { name, amount, description });

    // Generate unique order code
    const orderCode = body.orderCode || Date.now();
    
    // Default URLs
    const origin = req.headers.get("origin") || "https://preview--ai-dating-playground.lovable.app";
    const returnUrl = body.returnUrl || `${origin}/payment-success`;
    const cancelUrl = body.cancelUrl || `${origin}/payment-cancel`;

    console.log("📝 Payment details:", { orderCode, amount, description });

    // Create payment data
    const paymentData = {
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
      signature: ""
    };

    // Create signature for PayOS
    const dataStr = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(checksumKey);
    const messageData = encoder.encode(dataStr);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureArrayBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureArray = new Uint8Array(signatureArrayBuffer);
    const signature = Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    paymentData.signature = signature;

    console.log("🔐 Signature generated");

    // Call PayOS API to create payment
    const payosResponse = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
      body: JSON.stringify(paymentData),
    });

    if (!payosResponse.ok) {
      const errorText = await payosResponse.text();
      console.error("❌ PayOS API Error:", errorText);
      throw new Error(`PayOS API Error: ${payosResponse.status} - ${errorText}`);
    }

    const payosResult = await payosResponse.json();
    console.log("✅ PayOS payment created successfully");

    // Store payment info in database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("payos_invoices").insert({
      user_id: user.id,
      order_code: orderCode,
      amount,
      description,
      status: "PENDING",
      payos_data: payosResult
    });

    console.log("💾 Payment record saved to database");

    return new Response(
      JSON.stringify({
        error: 0,
        message: "Success",
        data: {
          checkoutUrl: payosResult.data.checkoutUrl,
          orderCode,
          paymentLinkId: payosResult.data.paymentLinkId,
          amount,
          description
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("💥 Error creating PayOS payment:", error);
    return new Response(
      JSON.stringify({
        error: 1,
        message: error.message || "Internal server error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});