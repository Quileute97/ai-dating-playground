import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { OrderCodeSchema } from "./zod-validation.ts";

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
    console.log("🔍 Checking payment status...");

    // Get PayOS credentials
    const clientId = Deno.env.get("PAYOS_CLIENT_ID");
    const apiKey = Deno.env.get("PAYOS_API_KEY");

    if (!clientId || !apiKey) {
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
    if (!user) throw new Error("User not authenticated");

    // Get and validate order code from query params
    const url = new URL(req.url);
    const rawOrderCode = url.searchParams.get("orderCode");
    
    if (!rawOrderCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order code is required"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Validate order code format
    const validationResult = OrderCodeSchema.safeParse(rawOrderCode);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid order code format",
          details: validationResult.error.errors
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const orderCode = validationResult.data;
    console.log("🔍 Checking order:", orderCode);

    // Check payment status with PayOS
    const payosResponse = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
    });

    if (!payosResponse.ok) {
      const errorText = await payosResponse.text();
      console.error("❌ PayOS API Error:", errorText);
      throw new Error(`PayOS API Error: ${payosResponse.status}`);
    }

    const payosResult = await payosResponse.json();
    console.log("📋 PayOS payment status:", payosResult.data.status);

    // Get payment from database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: invoice, error: invoiceError } = await supabase
      .from("payos_invoices")
      .select("*")
      .eq("order_code", orderCode)
      .eq("user_id", user.id)
      .single();

    if (invoiceError) {
      console.error("❌ Error fetching invoice:", invoiceError);
      throw new Error("Payment not found");
    }

    // Update status if changed
    const payosStatus = payosResult.data.status;
    let dbStatus = "PENDING";
    
    if (payosStatus === "PAID") {
      dbStatus = "PAID";
    } else if (payosStatus === "CANCELLED") {
      dbStatus = "FAILED";
    }

    if (invoice.status !== dbStatus) {
      await supabase
        .from("payos_invoices")
        .update({
          status: dbStatus,
          payos_data: payosResult.data,
          updated_at: new Date().toISOString()
        })
        .eq("order_code", orderCode);

      // If payment successful, upgrade user to premium
      if (dbStatus === "PAID") {
        const premiumExpires = new Date();
        premiumExpires.setDate(premiumExpires.getDate() + 30);

        await supabase
          .from("profiles")
          .update({
            is_premium: true,
            premium_expires: premiumExpires.toISOString(),
          })
          .eq("id", user.id);

        console.log("✅ User upgraded to premium");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orderCode,
          status: dbStatus,
          amount: invoice.amount,
          description: invoice.description,
          isPaid: dbStatus === "PAID"
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("💥 Error checking payment status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});