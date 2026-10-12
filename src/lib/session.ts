import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Stateless signed session cookie: base64url(payload).base64url(hmac). httpOnly, so JS can't read it.
export const SESSION_COOKIE = "swift_session";
export const CART_COOKIE = "swift_cart";
const SESSION_DAYS = 30;
const CART_DAYS = 60;

export type Session = { uid: string; role: "CUSTOMER" | "ADMIN"; exp: number };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return s;
}

function sign(data: string) {
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

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function getSession(): Promise<Session | null> {
  return decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function startSession(uid: string, role: Session["role"]) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  (await cookies()).set(SESSION_COOKIE, encodeSession({ uid, role, exp }), { ...cookieBase, maxAge: SESSION_DAYS * 86400 });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getCartSessionId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

export async function newCartSessionId() {
  const id = randomBytes(18).toString("base64url");
  (await cookies()).set(CART_COOKIE, id, { ...cookieBase, maxAge: CART_DAYS * 86400 });
  return id;
}

export async function clearCartSession() {
  (await cookies()).delete(CART_COOKIE);
}

/** HMAC of an OTP code, so codes are never stored in plain text. */
export function hashCode(phone: string, code: string) {
  return createHmac("sha256", secret()).update(`${phone}:${code}`).digest("hex");
}

export function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}
