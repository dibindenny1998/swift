import { createHmac, timingSafeEqual } from "node:crypto";

// Pure signed-token helpers (no next/headers), so the proxy can use them too.
export const SESSION_COOKIE = "swift_session";

export type Session = { uid: string; role: "CUSTOMER" | "ADMIN"; exp: number };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return s;
}

export function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function encodeSession(s: Session) {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}

/** HMAC of an OTP code, so codes are never stored in plain text. */
export function hashCode(phone: string, code: string) {
  return createHmac("sha256", secret()).update(`${phone}:${code}`).digest("hex");
}
