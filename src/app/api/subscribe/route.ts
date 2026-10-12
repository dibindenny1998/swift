import { z } from "zod";
import { db } from "@/lib/db";

const email = z.email().max(254);
const indianMobile = /^(?:\+?91)?[6-9]\d{9}$/;

const bodySchema = z.object({ contact: z.string().trim().min(1, "Enter your email or phone number").max(254) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const raw = parsed.data.contact;
  const digits = raw.replace(/[\s-]/g, "");

  let contact: string;
  let kind: "EMAIL" | "PHONE";
  if (email.safeParse(raw).success) {
    contact = raw.toLowerCase();
    kind = "EMAIL";
  } else if (indianMobile.test(digits)) {
    contact = `+91${digits.slice(-10)}`;
    kind = "PHONE";
  } else {
    return Response.json({ error: "Enter a valid email or 10-digit Indian mobile number" }, { status: 400 });
  }

  await db.subscriber.upsert({ where: { contact }, update: {}, create: { contact, kind } });
  return Response.json({ ok: true });
}
