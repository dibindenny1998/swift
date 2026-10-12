import "server-only";

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function error(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Reject cross-site state-changing requests (defence in depth on top of SameSite cookies). */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers / server tools
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}
