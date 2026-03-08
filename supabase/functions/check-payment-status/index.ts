import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { OrderCodeSchema } from "./zod-validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAR_PACKAGES: Record<string, number> = {
  'stars_10': 10,
  'stars_50': 50,
  'stars_100': 100,
};

const PACKAGE_DURATIONS: Record<string, number> = {
  'dating_week': 7,
  'dating_month': 30,
  'dating_lifetime': -1,
  'nearby_week': 7,
  'nearby_month': 30,
  'nearby_lifetime': -1,
};

function detectPackageType(description: string | null): string {
  if (!description) return '';
  if (description.includes('Nap 10 sao')) return 'stars_10';
  if (description.includes('Nap 50 sao')) return 'stars_50';
  if (description.includes('Nap 100 sao')) return 'stars_100';
  if (description.includes('Premium 1 thang')) return 'dating_month';
  if (description.includes('Premium 1 tuan')) return 'dating_week';
  if (description.includes('Premium Vinh vien') || description.includes('Premium vinh vien')) return 'dating_lifetime';
  if (description.includes('Nearby 1 thang')) return 'nearby_month';
  if (description.includes('Nearby 1 tuan')) return 'nearby_week';
  if (description.includes('Nearby Vinh vien') || description.includes('Nearby vinh vien')) return 'nearby_lifetime';
  return '';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 Checking payment status...");

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

    // Get order code from query params or body
    const url = new URL(req.url);
    let rawOrderCode = url.searchParams.get("orderCode");
    
    if (!rawOrderCode) {
      try {
        const body = await req.json();
        rawOrderCode = body?.orderCode?.toString() || null;
      } catch {}
    }

    if (!rawOrderCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Order code is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const validationResult = OrderCodeSchema.safeParse(rawOrderCode);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid order code format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
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
    console.log("📋 PayOS payment status:", payosResult.data?.status);

    // Admin client for DB operations
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

    const payosStatus = payosResult.data?.status;
    let dbStatus = "PENDING";

    if (payosStatus === "PAID") {
      dbStatus = "PAID";
    } else if (payosStatus === "CANCELLED") {
      dbStatus = "FAILED";
    }

    let starsAdded = 0;

    if (invoice.status !== dbStatus) {
      await supabase
        .from("payos_invoices")
        .update({
          status: dbStatus,
          payos_data: payosResult.data,
          updated_at: new Date().toISOString()
        })
        .eq("order_code", orderCode);

      if (dbStatus === "PAID") {
        const packageType = detectPackageType(invoice.description);
        console.log("📦 Package type:", packageType);

        if (packageType in STAR_PACKAGES) {
          // Handle star purchase
          const starAmount = STAR_PACKAGES[packageType];
          console.log(`⭐ Adding ${starAmount} stars to user ${user.id}`);

          const { data: existing } = await supabase
            .from('user_stars')
            .select('id, balance')
            .eq('user_id', user.id)
            .maybeSingle();

          if (existing) {
            await supabase.from('user_stars').update({
              balance: existing.balance + starAmount,
              updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
          } else {
            await supabase.from('user_stars').insert({
              user_id: user.id,
              balance: starAmount
            });
          }

          await supabase.from('star_transactions').insert({
            user_id: user.id,
            type: 'purchase',
            amount: starAmount,
            order_code: orderCode,
            note: `Mua ${starAmount} sao qua PayOS`
          });

          starsAdded = starAmount;
          console.log(`✅ Added ${starAmount} stars`);

        } else if (packageType in PACKAGE_DURATIONS) {
          // Handle premium upgrade
          const durationDays = PACKAGE_DURATIONS[packageType];
          let premiumExpires = null;

          if (durationDays !== -1) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + durationDays);
            premiumExpires = expirationDate.toISOString();
          }

          await supabase
            .from("profiles")
            .update({
              is_premium: true,
              premium_expires: premiumExpires,
            })
            .eq("id", user.id);

          console.log("✅ User upgraded to premium");
        }
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
          isPaid: dbStatus === "PAID",
          starsAdded,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("💥 Error checking payment status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
