import { getBundles, getGiftBoxBuilder } from "@/lib/catalog";

export async function GET() {
  const [kits, giftBox] = await Promise.all([getBundles(), getGiftBoxBuilder()]);
  return Response.json({ kits, giftBox });
}
