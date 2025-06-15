
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // KHÔNG dùng public anon key, phải dùng service role cho quyền xóa
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id } = await req.json();
    if (!conversation_id) {
      return new Response(JSON.stringify({ error: "conversation_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Xóa cả 2 conversation có id = conversation_id hoặc user_fake_id reference đến (song song 2 chiều)
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversation_id)
      .or(`id.eq.${conversation_id}`);

    if (error) {
      console.error("[delete-chat-data] Error deleting conversations", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Do bảng messages đã có ON DELETE CASCADE nên không cần xóa tiếp trên bảng messages.
    // Tuy nhiên, nếu muốn bắt buộc dọn dẹp nữa:
    // await supabase.from("messages").delete().eq('conversation_id', conversation_id);

    return new Response(JSON.stringify({ status: "deleted" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[delete-chat-data] Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
