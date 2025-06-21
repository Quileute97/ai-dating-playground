
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting expired subscriptions check...');

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();
    
    // Find all approved subscriptions that have expired
    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from('upgrade_requests')
      .select('*')
      .eq('status', 'approved')
      .not('expires_at', 'is', null)
      .lt('expires_at', now);

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      throw new Error('Failed to fetch expired subscriptions');
    }

    console.log(`Found ${expiredSubscriptions?.length || 0} expired subscriptions`);

    let updatedCount = 0;

    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      // Update expired subscriptions to 'expired' status
      const { data: updateResult, error: updateError } = await supabase
        .from('upgrade_requests')
        .update({
          status: 'expired',
          note: 'Subscription expired automatically'
        })
        .in('id', expiredSubscriptions.map(sub => sub.id))
        .select();

      if (updateError) {
        console.error('Error updating expired subscriptions:', updateError);
        throw new Error('Failed to update expired subscriptions');
      }

      updatedCount = updateResult?.length || 0;
      console.log(`Updated ${updatedCount} expired subscriptions`);

      // Log the expired subscriptions for monitoring
      for (const subscription of expiredSubscriptions) {
        console.log(`Expired subscription: User ${subscription.user_id}, Type: ${subscription.type}, Expired at: ${subscription.expires_at}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${updatedCount} expired subscriptions`,
      expiredCount: expiredSubscriptions?.length || 0,
      updatedCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Check expired subscriptions error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to check expired subscriptions'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
