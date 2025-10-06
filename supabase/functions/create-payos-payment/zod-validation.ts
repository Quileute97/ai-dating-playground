// Zod validation schemas for input validation
export { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const PaymentRequestSchema = z.object({
  packageType: z.enum([
    'dating_week',
    'dating_month', 
    'dating_lifetime',
    'nearby_week',
    'nearby_month',
    'nearby_unlimited'
  ], {
    errorMap: () => ({ message: "Invalid package type" })
  }),
  userId: z.string().uuid({ message: "Invalid user ID format" }),
  userEmail: z.string().email({ message: "Invalid email format" }).optional(),
  orderCode: z.number().int().positive().optional(),
  returnUrl: z.string().url({ message: "Invalid return URL" }).optional(),
  cancelUrl: z.string().url({ message: "Invalid cancel URL" }).optional()
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
