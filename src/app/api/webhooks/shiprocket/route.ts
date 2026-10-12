import { timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { fromShiprocket } from "@/lib/order-status";
import { setOrderStatus } from "@/lib/orders";

type Scan = { date?: string; activity?: string; location?: string; "sr-status-label"?: string };
type Payload = {
  awb?: string | number;
  current_status?: string;
  shipment_status?: string;
  courier_name?: string;
  etd?: string;
  scans?: Scan[];
};

function tokenOk(given: string | null) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN ?? "";
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Shiprocket tracking push → Shipment.events + Order.status. Auth via the token set in Shiprocket's webhook settings. */
export async function POST(request: Request) {
  if (!tokenOk(request.headers.get("x-api-key"))) return Response.json({ error: "unauthorised" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Payload | null;
  const awb = body?.awb ? String(body.awb) : null;
  if (!body || !awb) return Response.json({ ok: true, ignored: true });

  const shipment = await db.shipment.findUnique({ where: { awb } });
  if (!shipment) return Response.json({ ok: true, ignored: "unknown awb" });

  const rawStatus = body.current_status ?? body.shipment_status ?? "";
  await db.shipment.update({
    where: { id: shipment.id },
    data: {
      status: rawStatus || shipment.status,
      courier: body.courier_name ?? shipment.courier,
      events: (body.scans ?? []) as Prisma.InputJsonValue,
    },
  });

  const next = fromShiprocket(rawStatus);
  if (next) {
    const lastScan = body.scans?.at(-1);
    await setOrderStatus(shipment.orderId, next, {
      note: [rawStatus, lastScan?.location].filter(Boolean).join(" · ") || undefined,
    }).catch((e) => console.error("shiprocket status update failed", e));
  }
  return Response.json({ ok: true });
}
