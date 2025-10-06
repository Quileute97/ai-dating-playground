// Zod validation schemas for input validation
export { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const OrderCodeSchema = z.string().regex(/^\d+$/, {
  message: "Order code must be numeric"
}).transform(val => val);
