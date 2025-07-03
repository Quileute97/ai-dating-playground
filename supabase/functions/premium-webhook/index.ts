
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
    console.log('Premium webhook received:', webhookData);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Xử lý webhook từ PayOS
    if (webhookData.code === '00' && webhookData.data) {
      const { orderCode, status } = webhookData.data;
      
      if (status === 'PAID') {
        console.log('Payment successful for order:', orderCode);
        
        // Cập nhật trạng thái hóa đơn
        const { data: invoice, error: fetchError } = await supabase
          .from('payos_invoices')
          .select('*')
          .eq('order_code', orderCode)
          .single();

        if (fetchError || !invoice) {
          console.error('Invoice not found:', orderCode);
          throw new Error('Invoice not found');
        }

        // Cập nhật hóa đơn thành PAID
        const { error: updateInvoiceError } = await supabase
          .from('payos_invoices')
          .update({
            status: 'PAID',
            updated_at: new Date().toISOString(),
            payos_data: webhookData
          })
          .eq('order_code', orderCode);

        if (updateInvoiceError) {
          console.error('Error updating invoice:', updateInvoiceError);
          throw updateInvoiceError;
        }

        // Tính thời gian hết hạn Premium (30 ngày)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Cập nhật trạng thái Premium cho user
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({
            is_premium: true,
            premium_expires: expiryDate.toISOString()
          })
          .eq('id', invoice.user_id);

        if (updateProfileError) {
          console.error('Error updating profile:', updateProfileError);
          throw updateProfileError;
        }

        console.log('Premium activated for user:', invoice.user_id);
        
      } else if (status === 'CANCELLED') {
        // Cập nhật hóa đơn thành CANCELLED
        await supabase
          .from('payos_invoices')
          .update({
            status: 'CANCELLED',
            updated_at: new Date().toISOString()
          })
          .eq('order_code', orderCode);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Premium webhook error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Webhook processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
