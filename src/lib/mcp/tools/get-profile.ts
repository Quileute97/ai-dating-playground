import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Get profile",
  description: "Get a Hyliya public profile by user id or username.",
  inputSchema: {
    id: z.string().optional().describe("User UUID."),
    username: z.string().optional().describe("Username (used if id is not provided)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, username }) => {
    if (!id && !username) {
      return { content: [{ type: "text", text: "Provide either id or username." }], isError: true };
    }
    const supabase = supabaseAnon();
    let query = supabase
      .from("profiles")
      .select("id, username, display_name, bio, age, gender, location, avatar_url, album, is_premium, created_at")
      .limit(1);
    query = id ? query.eq("id", id) : query.eq("username", username!);
    const { data, error } = await query.maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: "Profile not found." }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { profile: data },
    };
  },
});
