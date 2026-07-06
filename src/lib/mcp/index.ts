import { defineMcp } from "@lovable.dev/mcp-js";
import searchProfiles from "./tools/search-profiles";
import getProfile from "./tools/get-profile";
import listRecentPosts from "./tools/list-recent-posts";

export default defineMcp({
  name: "hyliya-mcp",
  title: "Hyliya MCP",
  version: "0.1.0",
  instructions:
    "Tools for Hyliya (AI dating & chat). Use `search_profiles` to find users, `get_profile` for details, and `list_recent_posts` for the public timeline.",
  tools: [searchProfiles, getProfile, listRecentPosts],
});
