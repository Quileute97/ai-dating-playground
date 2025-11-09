import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

interface FakeUser {
  id: string;
  name: string;
  created_at?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://hyliya.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch active fake users (limit to 50000 per sitemap)
    const { data: fakeUsers } = await supabase
      .from('fake_users')
      .select('id, name, created_at')
      .eq('is_active', true)
      .limit(50000);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    if (fakeUsers && fakeUsers.length > 0) {
      fakeUsers.forEach((user: FakeUser) => {
        const lastmod = user.created_at
          ? new Date(user.created_at).toISOString().split('T')[0]
          : currentDate;
        
        sitemap += `  <url>
    <loc>${baseUrl}/fake-profile/${user.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
      });
    }

    sitemap += `</urlset>`;

    console.log(`Generated fake profiles sitemap with ${fakeUsers?.length || 0} URLs`);

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating fake profiles sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
