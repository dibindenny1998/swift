import { randomInt } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { clientIp, error, json, readJson, sameOrigin } from "@/lib/http";
import { msg91Configured, sendOtpSms } from "@/lib/msg91";
import { normalizeIndianMobile } from "@/lib/phone";
import { hashCode } from "@/lib/session";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const CODE_TTL_MS = 5 * 60 * 1000;

const schema = z.object({ phone: z.string().max(20) });

// Codes are echoed back only when explicitly allowed (local dev or a staging site without SMS keys).
const echoCodes = () => process.env.NODE_ENV !== "production" || process.env.OTP_DEV_ECHO === "true";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const parsed = schema.safeParse(await readJson(request));
  const phone = parsed.success ? normalizeIndianMobile(parsed.data.phone) : null;
  if (!phone) return error("Enter a valid 10-digit mobile number");

  const ip = clientIp(request);
  const since = new Date(Date.now() - WINDOW_MS);
  const [byPhone, byIp] = await Promise.all([
    db.otpRequest.count({ where: { phone, createdAt: { gte: since } } }),
    db.otpRequest.count({ where: { ip, createdAt: { gte: since } } }),
  ]);
  if (byPhone >= MAX_PER_WINDOW || byIp >= MAX_PER_WINDOW * 3) {
    return error("Too many codes requested. Please try again in a few minutes.", 429);
  }

  if (!msg91Configured() && !echoCodes()) return error("Phone login isn't available yet. Please try again later.", 503);

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.otpRequest.create({
    data: { phone, ip, codeHash: hashCode(phone, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  if (msg91Configured()) {
    try {
      await sendOtpSms(phone, code);
    } catch (e) {
      console.error("OTP send failed", e);
      return error("We couldn't send the SMS. Please try again.", 502);
    }
    return json({ ok: true });
  }
  console.info(`[dev] OTP for ${phone}: ${code}`);
  return json({ ok: true, devCode: code });
}
