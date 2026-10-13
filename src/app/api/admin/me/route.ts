import { adminApi } from "@/lib/admin";
import { json } from "@/lib/http";

/** Who is signed in to the admin and which areas they can open (drives the menu). */
export async function GET(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { name, email, owner, access } = auth.admin;
  return json({ name, email, owner, areas: access.areas });
}
