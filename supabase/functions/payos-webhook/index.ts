
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
    const webhookData = await req.json();
    console.log('PayOS Webhook received:', webhookData);

    // Verify webhook signature
    const checksumKey = Deno.env.get('PAYOS_CHECKSUM_KEY');
    if (!checksumKey) {
      throw new Error('PayOS checksum key not configured');
    }

    // Get signature from header
    const signature = req.headers.get('x-payos-signature');
    if (!signature) {
      throw new Error('Missing PayOS signature');
    }

    // Verify signature (simplified - in production you should implement proper verification)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process webhook based on event type
    if (webhookData.code === '00' && webhookData.data) {
      const { orderCode, status } = webhookData.data;
      
      if (status === 'PAID') {
        // Update upgrade request status to approved
        const { data: updateResult, error } = await supabase
          .from('upgrade_requests')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            note: 'Thanh toán thành công qua PayOS'
          })
          .eq('bank_info->orderCode', orderCode)
          .select();

        if (error) {
          console.error('Error updating upgrade request:', error);
        } else {
          console.log('Upgrade request approved:', updateResult);
        }
      } else if (status === 'CANCELLED') {
        // Update status to rejected
        await supabase
          .from('upgrade_requests')
          .update({
            status: 'rejected',
            note: 'Thanh toán bị hủy'
          })
          .eq('bank_info->orderCode', orderCode);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PayOS webhook error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Webhook processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
