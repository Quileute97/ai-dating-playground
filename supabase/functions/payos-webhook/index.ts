import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔔 PayOS Webhook received");

    // Get PayOS credentials
    const checksumKey = Deno.env.get("PAYOS_CHECKSUM_KEY");
    if (!checksumKey) {
      throw new Error("PayOS checksum key not configured");
    }

    // Parse webhook data
    const webhookData = await req.json();
    console.log("📋 Webhook data:", JSON.stringify(webhookData, null, 2));

    // Verify webhook signature
    const { data, signature } = webhookData;
    if (!data || !signature) {
      throw new Error("Invalid webhook data structure");
    }

    // Create signature for verification
    const dataStr = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');

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
    const expectedSignature = Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error("❌ Invalid webhook signature");
      throw new Error("Invalid signature");
    }

    console.log("✅ Webhook signature verified");

    // Process payment result
    const { orderCode, code, desc, success } = data;
    
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update payment status
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("payos_invoices")
      .update({
        status: success ? "PAID" : "FAILED",
        payos_data: { ...data, webhook_received_at: new Date().toISOString() },
        updated_at: new Date().toISOString()
      })
      .eq("order_code", orderCode)
      .select("user_id")
      .single();

    if (invoiceError) {
      console.error("❌ Error updating invoice:", invoiceError);
      throw new Error("Failed to update invoice");
    }

    console.log("💾 Invoice updated successfully");

    // If payment successful, upgrade user to premium
    if (success && invoiceData?.user_id) {
      console.log("🎉 Payment successful, upgrading user to premium");
      
      // Calculate premium expiry (30 days from now)
      const premiumExpires = new Date();
      premiumExpires.setDate(premiumExpires.getDate() + 30);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_expires: premiumExpires.toISOString(),
        })
        .eq("id", invoiceData.user_id);

      if (profileError) {
        console.error("❌ Error updating user profile:", profileError);
        throw new Error("Failed to update user profile");
      }

      console.log("✅ User upgraded to premium successfully");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("💥 Error processing PayOS webhook:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});