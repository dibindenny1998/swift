import { z } from "zod";
import { mergeGuestCart } from "@/lib/cart-server";
import { db } from "@/lib/db";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { normalizeIndianMobile } from "@/lib/phone";
import { hashCode, safeEqualHex, startSession } from "@/lib/session";

const MAX_ATTEMPTS = 5;
const schema = z.object({ phone: z.string().max(20), code: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const parsed = schema.safeParse(await readJson(request));
  const phone = parsed.success ? normalizeIndianMobile(parsed.data.phone) : null;
  if (!parsed.success || !phone) return error("Enter the 6-digit code");

  const otp = await db.otpRequest.findFirst({
    where: { phone, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return error("That code has expired. Request a new one.", 410);
  if (otp.attempts >= MAX_ATTEMPTS) return error("Too many wrong tries. Request a new code.", 429);

  if (!safeEqualHex(otp.codeHash, hashCode(phone, parsed.data.code))) {
    await db.otpRequest.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    const left = MAX_ATTEMPTS - otp.attempts - 1;
    return error(left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong tries. Request a new code.", 401);
  }

  // Single use: burn every outstanding code for this number.
  await db.otpRequest.updateMany({ where: { phone, expiresAt: { gt: new Date() } }, data: { expiresAt: new Date() } });

  const user = await db.user.upsert({ where: { phone }, update: {}, create: { phone } });
  // Phone sign-in is always a customer session; the admin panel uses email + password.
  await startSession(user.id, "CUSTOMER");
  await mergeGuestCart(user.id);
  return json({ user: { id: user.id, phone: user.phone, name: user.name } });
}
