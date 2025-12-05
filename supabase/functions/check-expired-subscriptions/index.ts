
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('🔄 Checking for expired premium subscriptions...');

    // Get current time
    const now = new Date().toISOString();

    // Find all users with expired premium subscriptions
    const { data: expiredUsers, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('id, premium_expires, is_premium')
      .eq('is_premium', true)
      .not('premium_expires', 'is', null)
      .lt('premium_expires', now);

    if (selectError) {
      console.error('❌ Error finding expired users:', selectError);
      throw selectError;
    }

    console.log(`📊 Found ${expiredUsers?.length || 0} expired premium users`);

    let updatedCount = 0;

    if (expiredUsers && expiredUsers.length > 0) {
      // Update expired users to remove premium status
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          is_premium: false,
          premium_expires: null
        })
        .in('id', expiredUsers.map(user => user.id));

      if (updateError) {
        console.error('❌ Error updating expired users:', updateError);
        throw updateError;
      }

      updatedCount = expiredUsers.length;

      // Also update subscription records to expired status
      const { error: subscriptionUpdateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'expired'
        })
        .in('user_id', expiredUsers.map(user => user.id))
        .eq('status', 'active')
        .not('expires_at', 'is', null)
        .lt('expires_at', now);

      if (subscriptionUpdateError) {
        console.error('❌ Error updating subscription status:', subscriptionUpdateError);
        // Don't throw, as main profile update succeeded
      }

      console.log(`✅ Successfully updated ${updatedCount} expired premium users`);
    }

    // Also check legacy upgrade_requests table for backwards compatibility
    const { data: expiredRequests, error: legacyError } = await supabaseAdmin
      .from('upgrade_requests')
      .select('*')
      .eq('status', 'approved')
      .not('expires_at', 'is', null)
      .lt('expires_at', now);

    let legacyUpdatedCount = 0;
    if (expiredRequests && expiredRequests.length > 0) {
      const { error: legacyUpdateError } = await supabaseAdmin
        .from('upgrade_requests')
        .update({
          status: 'expired',
          note: 'Subscription expired automatically'
        })
        .in('id', expiredRequests.map(req => req.id));

      if (!legacyUpdateError) {
        legacyUpdatedCount = expiredRequests.length;
        console.log(`✅ Also updated ${legacyUpdatedCount} legacy upgrade requests`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Checked and updated ${updatedCount} expired premium subscriptions`,
      updatedCount,
      legacyUpdatedCount,
      checkedAt: now
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error checking expired subscriptions:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
