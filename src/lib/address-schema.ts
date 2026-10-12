import { z } from "zod";
import { PINCODE_RE } from "./delivery";
import { INDIAN_STATES } from "./india";
import { normalizeIndianMobile } from "./phone";

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's name").max(80),
  phone: z
    .string()
    .transform((v, ctx) => {
      const n = normalizeIndianMobile(v);
      if (!n) ctx.addIssue({ code: "custom", message: "Enter a valid 10-digit mobile number" });
      return n ?? "";
    }),
  line1: z.string().trim().min(3, "Enter house / flat and street").max(120),
  line2: z.string().trim().max(120).optional().transform((v) => v || null),
  city: z.string().trim().min(2, "Enter the city").max(60),
  state: z.enum(INDIAN_STATES, { error: "Choose a state" }),
  pincode: z.string().trim().regex(PINCODE_RE, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean().optional(),
});
