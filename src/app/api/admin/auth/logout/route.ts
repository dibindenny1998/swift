import { error, json, sameOrigin } from "@/lib/http";
import { endSession } from "@/lib/session";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  await endSession();
  return json({ ok: true });
}
