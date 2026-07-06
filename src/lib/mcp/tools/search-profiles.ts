import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_profiles",
  title: "Search profiles",
  description:
    "Search Hyliya user profiles by username, display name, or location keyword. Returns public profile info only.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search keyword (matches username, display name, or location)."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum number of results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const q = query.replace(/[%_]/g, "");
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, bio, age, gender, location, avatar_url, is_premium")
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,location.ilike.%${q}%`)
      .limit(limit ?? 10);
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { profiles: data ?? [] },
    };
  },
});
