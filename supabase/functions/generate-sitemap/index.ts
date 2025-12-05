import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

interface Profile {
  id: string;
  name: string;
  updated_at?: string;
}

interface FakeUser {
  id: string;
  name: string;
  created_at?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://hyliya.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch active profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, updated_at')
      .eq('tai_khoan_hoat_dong', true)
      .limit(1000);

    // Fetch active fake users
    const { data: fakeUsers } = await supabase
      .from('fake_users')
      .select('id, name, created_at')
      .eq('is_active', true)
      .limit(1000);

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Main Features -->
  <url>
    <loc>${baseUrl}/chat</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/dating</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/nearby</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/timeline</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- User Profiles -->
`;

    // Add real user profiles
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile: Profile) => {
        const lastmod = profile.updated_at 
          ? new Date(profile.updated_at).toISOString().split('T')[0]
          : currentDate;
        
        sitemap += `  <url>
    <loc>${baseUrl}/profile/${profile.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      });
    }

    // Add fake user profiles
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

    // Static pages
    sitemap += `
  <!-- User Features -->
  <url>
    <loc>${baseUrl}/reset-password</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Payment Pages -->
  <url>
    <loc>${baseUrl}/payment-success</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>${baseUrl}/payment-cancel</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

</urlset>`;

    console.log(`Generated sitemap with ${(profiles?.length || 0) + (fakeUsers?.length || 0)} profile URLs`);

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});