import { z } from "zod";
import { estimateDelivery, PINCODE_RE } from "@/lib/delivery";
import { getSettings } from "@/lib/settings-server";
import { serviceability, shiprocketConfigured } from "@/lib/shiprocket";

const bodySchema = z.object({
  pincode: z.string().trim().regex(PINCODE_RE, "Enter a valid 6-digit pincode"),
  weightGrams: z.number().int().positive().max(50_000).default(500),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const { pincode, weightGrams } = parsed.data;
  const settings = await getSettings();

  if (shiprocketConfigured()) {
    try {
      const live = await serviceability(settings.pickupPincode, pincode, weightGrams / 1000, settings.codEnabled);
      if (!live) return Response.json({ serviceable: false });
      return Response.json({ serviceable: true, ...live, cod: settings.codEnabled && live.cod, source: "courier" });
    } catch (err) {
      console.error("pincode-check: falling back to estimate", err);
    }
  }
  // No courier keys yet (or Shiprocket is down): give an honest typical range instead.
  return Response.json({
    serviceable: true,
    ...estimateDelivery(settings.pickupPincode, pincode),
    cod: settings.codEnabled,
    source: "estimate",
  });
}
