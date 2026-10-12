import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "./lib/session-token";

// Optimistic gate for the admin area. Every admin page and API also checks the role itself (requireAdmin / adminApi).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") return NextResponse.next();

  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session?.role === "ADMIN") return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
