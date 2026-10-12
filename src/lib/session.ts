import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { decodeSession, encodeSession, SESSION_COOKIE, type Session } from "./session-token";

export { hashCode, SESSION_COOKIE, type Session } from "./session-token";

// Stateless signed session cookie: base64url(payload).base64url(hmac). httpOnly, so JS can't read it.
export const CART_COOKIE = "swift_cart";
const SESSION_DAYS = 30;
const ADMIN_SESSION_DAYS = 7;
const CART_DAYS = 60;

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
  const days = role === "ADMIN" ? ADMIN_SESSION_DAYS : SESSION_DAYS;
  const exp = Date.now() + days * 864e5;
  (await cookies()).set(SESSION_COOKIE, encodeSession({ uid, role, exp }), { ...cookieBase, maxAge: days * 86400 });
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

export function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}
