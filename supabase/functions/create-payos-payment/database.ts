
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { UpgradeRequestData } from './types.ts';

export const saveUpgradeRequest = async (upgradeRequestData: UpgradeRequestData) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  console.log('💾 Saving to database:', JSON.stringify(upgradeRequestData, null, 2));

  const { error: dbError } = await supabase
    .from('upgrade_requests')
    .insert(upgradeRequestData);

  if (dbError) {
    console.error('❌ Database error:', dbError);
    console.log('⚠️ Payment created but database save failed');
  } else {
    console.log('✅ Saved to database successfully');
  }
};
