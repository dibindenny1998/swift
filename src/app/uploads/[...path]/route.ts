import { readFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

/** Serves images uploaded from the admin when Cloudinary isn't used. Files are immutable (random names). */
export async function GET(_request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  await connection(); // reads the disk at request time, so never prerender
  const parts = (await ctx.params).path;
  const file = path.resolve(UPLOAD_DIR, ...parts);
  const ext = path.extname(file).slice(1).toLowerCase();
  if (!file.startsWith(UPLOAD_DIR + path.sep) || !TYPES[ext]) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
