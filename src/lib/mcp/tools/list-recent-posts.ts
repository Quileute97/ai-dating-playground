import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_recent_posts",
  title: "List recent posts",
  description: "List recent public timeline posts on Hyliya.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Maximum number of posts (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("timeline_posts")
      .select("id, user_id, content, media_urls, hashtags, likes_count, comments_count, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
