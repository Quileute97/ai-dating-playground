import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sitemapUrl = `${supabaseUrl}/functions/v1/generate-sitemap-index`;
    
    console.log('Pinging Google with sitemap:', sitemapUrl);

    // Ping Google
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const googleResponse = await fetch(googlePingUrl);
    
    console.log('Google ping response status:', googleResponse.status);

    // Ping Bing
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const bingResponse = await fetch(bingPingUrl);
    
    console.log('Bing ping response status:', bingResponse.status);

    // Log the ping activity to database
    const { error: logError } = await supabase
      .from('admin_settings')
      .upsert({
        setting_key: 'last_sitemap_ping',
        setting_value: {
          timestamp: new Date().toISOString(),
          google_status: googleResponse.status,
          bing_status: bingResponse.status
        },
        description: 'Last sitemap ping to search engines'
      }, {
        onConflict: 'setting_key'
      });

    if (logError) {
      console.error('Error logging ping activity:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sitemap pinged to search engines',
        google_status: googleResponse.status,
        bing_status: bingResponse.status,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error pinging sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
