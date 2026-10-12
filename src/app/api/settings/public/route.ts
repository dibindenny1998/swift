import { getSettings } from "@/lib/settings-server";

// Only what the storefront needs — never GSTIN, pickup address or anything admin-only.
export async function GET() {
  const s = await getSettings();
  return Response.json({
    announcement: s.announcement,
    countdownEnd: s.countdownEnd,
    lastOrderDate: s.lastOrderDate,
    freeShippingThreshold: s.freeShippingThreshold,
    shippingFee: s.shippingFee,
    codEnabled: s.codEnabled,
    codFee: s.codFee,
    giftWrapPrice: s.giftWrapPrice,
    lowStockThreshold: s.lowStockThreshold,
    effects: s.effects,
    social: s.social,
    whatsappNumber: s.whatsappNumber,
  });
}
